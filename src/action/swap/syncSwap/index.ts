import Big from "big.js";
import { ethers } from "ethers";
import { Transaction } from "web3";

import {
  CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY,
  CONTRACT_SYNCSWAP_ROUTER,
} from "../../../abi/constants/contracts";
import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import Account from "../../../core/account";
import SwapAction from "../../../core/action/swap";
import Token from "../../../core/token";
import RunnableTransaction from "../../../core/transaction";
import logger from "../../../utils/other/logger";

const withdrawMode = {
  VAULT_INTERNAL_TRANSFER: 0,
  WITHDRAW_ETH: 1,
  WITHDRAW_WETH: 2,
};

class SyncswapSwapAction extends SwapAction {
  constructor() {
    super({ provider: "SYNCSWAP" });
  }

  private async getPool(params: {
    fromToken: Token;
    toToken: Token;
    isReversed?: boolean;
  }): Promise<string> {
    const { fromToken, toToken, isReversed = false } = params;
    const { chain } = fromToken;

    try {
      const classicPoolFactoryContractAddress = chain.getContractAddressByName(
        CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY,
      );

      if (!classicPoolFactoryContractAddress) {
        throw new Error(
          `${this.name} action is not available in ${chain.name}`,
        );
      }

      const classicPoolFactoryContract = getWeb3Contract({
        w3: chain.w3,
        name: CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY,
        address: classicPoolFactoryContractAddress,
      });

      const poolAddress = await classicPoolFactoryContract.methods
        .getPool(
          fromToken.getAddressOrWrappedForNative(),
          toToken.getAddressOrWrappedForNative(),
        )
        .call();

      if (poolAddress === ethers.ZeroAddress) {
        throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
      }

      return poolAddress;
    } catch (error) {
      if (isReversed) throw error;
      logger.debug("reversing request");
      return await this.getPool({
        fromToken: toToken,
        toToken: fromToken,
        isReversed: true,
      });
    }
  }

  private async checkIsAllowed(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`,
      );
    }

    const { chain } = fromToken;

    const contractAddress = chain.getContractAddressByName(
      CONTRACT_SYNCSWAP_ROUTER,
    );

    if (!contractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (fromToken.isEquals(toToken)) {
      throw new Error(
        `action is not available for eq tokens: ${fromToken} -> ${toToken}`,
      );
    }

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address,
    );

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance =
        await fromToken.toReadableAmount(normalizedBalance);
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${fromToken} balance is less than amount: ${readableBalance} < ${readableAmount}`,
      );
    }

    return { contractAddress };
  }

  private async getSwapCall(params: {
    account: Account;
    fromToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    contractAddress: string;
    poolAddress: string;
  }) {
    const {
      account,
      fromToken,
      normalizedAmount,
      minOutNormalizedAmount,
      contractAddress,
      poolAddress,
    } = params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const encoder = new ethers.AbiCoder();

    const swapData = encoder.encode(
      ["address", "address", "uint8"],
      [
        fromToken.getAddressOrWrappedForNative(),
        account.address,
        withdrawMode.WITHDRAW_ETH,
      ],
    );

    const routerContract = getWeb3Contract({
      w3,
      name: CONTRACT_SYNCSWAP_ROUTER,
      address: contractAddress,
    });

    type SwapPath = Parameters<typeof routerContract.methods.swap>["0"][number];
    type SwapStep = SwapPath["0"][number];

    const step: SwapStep = [poolAddress, swapData, ethers.ZeroAddress, "0x"];

    const tokenIn = fromToken.isNative ? ethers.ZeroAddress : fromToken.address;

    const path: SwapPath = [[step], tokenIn, normalizedAmount];

    const deadline = await chain.getSwapDeadline();

    return routerContract.methods.swap(
      [path],
      minOutNormalizedAmount,
      deadline,
    );
  }

  private async getSwapTransaction(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    contractAddress: string;
  }) {
    const { account, fromToken, toToken, normalizedAmount, contractAddress } =
      params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      DEFAULT_SLIPPAGE_PERCENT,
    );

    const poolAddress = await this.getPool({ fromToken, toToken });

    const swapFunctionCall = await this.getSwapCall({
      account,
      fromToken,
      normalizedAmount,
      minOutNormalizedAmount,
      contractAddress,
      poolAddress,
    });

    const value = fromToken.isNative ? normalizedAmount : 0;

    const estimatedGas = await swapFunctionCall.estimateGas({
      from: account.address,
      value,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const swapTx: Transaction = {
      data: swapFunctionCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: contractAddress,
      value,
    };

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount,
    );

    return { swapTx, inReadableAmount, outReadableAmount };
  }

  async swap(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { contractAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const txs: RunnableTransaction[] = [];

    const approveTx = await fromToken.getApproveTransaction({
      account,
      spenderAddress: contractAddress,
      normalizedAmount,
    });

    if (approveTx) {
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);
      txs.push(
        new RunnableTransaction({
          name: "approve",
          chain: fromToken.chain,
          account,
          tx: approveTx,
          resultMsg: `${readableAmount} ${fromToken} success`,
        }),
      );
    }

    const { swapTx, inReadableAmount, outReadableAmount } =
      await this.getSwapTransaction({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        contractAddress,
      });

    txs.push(
      new RunnableTransaction({
        name: "swap",
        chain: fromToken.chain,
        account,
        tx: swapTx,
        resultMsg: `${inReadableAmount} ${fromToken} -> ${outReadableAmount} ${toToken} success`,
      }),
    );

    return { txs };
  }
}

export default SyncswapSwapAction;
