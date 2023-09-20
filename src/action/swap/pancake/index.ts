import Big from "big.js";

import {
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_PANCAKE_FACTORY,
  CONTRACT_PANCAKE_QUOTE,
} from "../../../abi/constants/contracts";
import getEthersInterface from "../../../abi/methods/getEthersInterface";
import {
  DEFAULT_GAS_MULTIPLIER,
  DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
  DEFAULT_SLIPPAGE_PERCENT,
} from "../../../constants";
import Account from "../../../core/account";
import SwapAction from "../../../core/action/swap";
import Chain from "../../../core/chain";
import Token from "../../../core/token";

import {
  FEE,
  INITIAL_GAS_MULTIPLIER,
  SQRT_PRICE_LIMIT_X96,
  UNWRAP_ETH_ADDRESS,
} from "./constants";
import RunnableTransaction from "../../../core/transaction";
import { ethers } from "ethers";
import logger from "../../../utils/other/logger";

class PancakeSwapAction extends SwapAction {
  constructor() {
    super({ provider: "PANCAKE" });
  }

  async getPool(params: {
    fromToken: Token;
    toToken: Token;
    isReversed?: boolean;
  }): Promise<string> {
    const { fromToken, toToken, isReversed } = params;
    const { chain } = fromToken;

    try {
      const poolFactoryContractAddress = chain.getContractAddressByName(
        CONTRACT_PANCAKE_FACTORY,
      );

      if (!poolFactoryContractAddress) {
        throw new Error(
          `${this.name} action is not available in ${chain.name}`,
        );
      }

      const pancakeFactoryInterface = getEthersInterface({
        name: "PancakeFactory",
      });

      const getPoolData = pancakeFactoryInterface.encodeFunctionData(
        "getPool",
        [
          fromToken.getAddressOrWrappedForNative(),
          toToken.getAddressOrWrappedForNative(),
          FEE,
        ],
      );

      const poolAddress = await chain.w3.eth.call({
        data: getPoolData,
        to: poolFactoryContractAddress,
      });

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

  private async getQuote(params: {
    chain: Chain;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: string | number;
  }) {
    const { chain, fromToken, toToken, normalizedAmount } = params;

    const poolQuoteContractAddress = chain.getContractAddressByName(
      CONTRACT_PANCAKE_QUOTE,
    );

    if (!poolQuoteContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const pancakeQuoteInterface = getEthersInterface({ name: "PancakeQuote" });

    const quoteExactInputSingleData = pancakeQuoteInterface.encodeFunctionData(
      "quoteExactInputSingle",
      [
        {
          tokenIn: fromToken.getAddressOrWrappedForNative(),
          tokenOut: toToken.getAddressOrWrappedForNative(),
          amountIn: normalizedAmount,
          fee: FEE,
          sqrtPriceLimitX96: SQRT_PRICE_LIMIT_X96,
        },
      ],
    );

    const quoteExactInputSingleResult = await chain.w3.eth.call({
      data: quoteExactInputSingleData,
      to: poolQuoteContractAddress,
    });

    const quote = pancakeQuoteInterface.decodeFunctionResult(
      "quoteExactInputSingle",
      quoteExactInputSingleResult,
    );

    const amountOut = quote[0];
    const gasEstimate = quote[3];

    const amount = amountOut.toString();
    const slippageAmount = Big(amount).times(DEFAULT_SLIPPAGE_PERCENT).div(100);
    const minOutNormalizedAmount = Big(amount)
      .minus(slippageAmount)
      .round()
      .toString();

    const estimatedGas = Big(gasEstimate.toString())
      .times(INITIAL_GAS_MULTIPLIER)
      .round()
      .toString();

    return { minOutNormalizedAmount, estimatedGas };
  }

  private async getSwapData(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
  }) {
    const {
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
    } = params;

    const { chain } = fromToken;

    const pancakeRouterInterface = getEthersInterface({
      name: "PancakeSwapRouter",
    });

    const address = toToken.isNative ? UNWRAP_ETH_ADDRESS : account.address;

    const exactInputSingleData = pancakeRouterInterface.encodeFunctionData(
      "exactInputSingle",
      [
        {
          tokenIn: fromToken.getAddressOrWrappedForNative(),
          tokenOut: toToken.getAddressOrWrappedForNative(),
          fee: FEE,
          recipient: address,
          amountIn: normalizedAmount,
          amountOutMinimum: minOutNormalizedAmount,
          sqrtPriceLimitX96: SQRT_PRICE_LIMIT_X96,
        },
      ],
    );

    const multicallBytesArray = [exactInputSingleData];

    if (toToken.isNative) {
      const unwrapEthData = pancakeRouterInterface.encodeFunctionData(
        "unwrapWETH9",
        [minOutNormalizedAmount, account.address],
      );
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = pancakeRouterInterface.encodeFunctionData("multicall", [
      deadline,
      multicallBytesArray,
    ]);

    return { data };
  }

  private async checkIsAllowed(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chain } = fromToken;

    const poolAddress = await this.getPool({ fromToken, toToken });

    if (!poolAddress) {
      throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`,
      );
    }

    const contractAddress = chain.getContractAddressByName(
      CONTRACT_PANCAKE_SWAP_ROUTER,
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

    const value = fromToken.isNative ? normalizedAmount : 0;

    const { minOutNormalizedAmount, estimatedGas } = await this.getQuote({
      chain,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const { data } = await this.getSwapData({
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const swapTx = {
      data,
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
        gasMultiplier: DEFAULT_GAS_MULTIPLIER,
        retryTimes: DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
      }),
    );

    return { txs };
  }
}

export default PancakeSwapAction;
