import Action from "../../core/action";
import Account from "../../core/account";
import {
  ACTION_SYNC_SWAP_ROUTER,
  CONTRACT_SYNC_SWAP_CLASSIC_POOL_FACTORY,
  CONTRACT_SYNC_SWAP_ROUTER,
  SLIPPAGE_PERCENT,
} from "../../common/constants";
import Token from "../../core/token";
import getContract from "../../utils/getContract";
import { ethers } from "ethers";
import Big from "big.js";
import Chain from "../../core/chain";

const withdrawMode = {
  VAULT_INTERNAL_TRANSFER: 0,
  WITHDRAW_ETH: 1,
  WITHDRAW_WETH: 2,
};

class SyncSwapRouter extends Action {
  name = ACTION_SYNC_SWAP_ROUTER;

  public getAddressToApprove(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_SYNC_SWAP_ROUTER);
  }

  async getPool(params: {
    chain: Chain;
    fromToken: Token;
    toToken: Token;
    isReversed?: boolean;
  }): Promise<string> {
    const { chain, fromToken, toToken, isReversed = false } = params;

    try {
      const classicPoolFactoryContractAddress = chain.getContractAddressByName(
        CONTRACT_SYNC_SWAP_CLASSIC_POOL_FACTORY
      );

      if (!classicPoolFactoryContractAddress) {
        throw new Error(
          `${this.name} action is not available in ${chain.name}`
        );
      }

      const classicPoolFactoryContract = getContract({
        w3: chain.w3,
        name: CONTRACT_SYNC_SWAP_CLASSIC_POOL_FACTORY,
        address: classicPoolFactoryContractAddress,
      });

      const poolAddress = await classicPoolFactoryContract.methods
        .getPool(fromToken.address, toToken.address)
        .call();

      return poolAddress;
    } catch (error) {
      if (isReversed) throw error;
      return await this.getPool({
        chain,
        toToken,
        fromToken,
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

    const { chain } = fromToken;

    const routerContractAddress = chain.getContractAddressByName(
      CONTRACT_SYNC_SWAP_ROUTER
    );

    if (!routerContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `syncswap is not available for tokens in different chains: ${fromToken} -> ${toToken}`
      );
    }

    const poolAddress = await this.getPool({ chain, fromToken, toToken });

    if (poolAddress === ethers.ZeroAddress) {
      throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
    }

    if (!fromToken.isNative) {
      const normalizedAllowance = await fromToken.normalizedAllowance(
        account,
        routerContractAddress
      );

      if (Big(normalizedAllowance).lt(normalizedAmount)) {
        const readableAllowance = await fromToken.toReadableAmount(
          normalizedAllowance
        );
        const readableAmount = await fromToken.toReadableAmount(
          normalizedAmount
        );

        throw new Error(
          `account ${fromToken} allowance is less than amount: ${readableAllowance} < ${readableAmount}`
        );
      }
    }

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address
    );

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance = await fromToken.toReadableAmount(
        normalizedBalance
      );
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${fromToken} balance is less than amount: ${readableBalance} < ${readableAmount}`
      );
    }

    return { routerContractAddress, poolAddress };
  }

  private async getSwapCall(params: {
    account: Account;
    fromToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    routerContractAddress: string;
    poolAddress: string;
  }) {
    const {
      account,
      fromToken,
      normalizedAmount,
      minOutNormalizedAmount,
      routerContractAddress,
      poolAddress,
    } = params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const encoder = new ethers.AbiCoder();

    const swapData = encoder.encode(
      ["address", "address", "uint8"],
      [fromToken.address, account.address, withdrawMode.WITHDRAW_ETH]
    );

    const routerContract = getContract({
      w3,
      name: CONTRACT_SYNC_SWAP_ROUTER,
      address: routerContractAddress,
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
      deadline
    );
  }

  async swap(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chain } = fromToken;
    const { w3 } = chain;
    const { routerContractAddress, poolAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      SLIPPAGE_PERCENT
    );

    const swapFunctionCall = await this.getSwapCall({
      account,
      fromToken,
      normalizedAmount,
      minOutNormalizedAmount,
      routerContractAddress,
      poolAddress,
    });

    const value = fromToken.isNative ? normalizedAmount : 0;

    const estimatedGas = await swapFunctionCall.estimateGas({
      from: account.address,
      value,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data: swapFunctionCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: routerContractAddress,
      value,
    };

    const hash = await account.signAndSendTransaction(chain, tx);

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount
    );

    return { hash, inReadableAmount, outReadableAmount };
  }
}

export default SyncSwapRouter;
