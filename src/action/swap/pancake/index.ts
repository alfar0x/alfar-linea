import Big from "big.js";
import { ethers } from "ethers";
import { Transaction } from "web3";

import {
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_PANCAKE_FACTORY,
  CONTRACT_PANCAKE_QUOTE,
} from "../../../abi/constants/contracts";
import getEthersInterface from "../../../abi/methods/getEthersInterface";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import SwapAction from "../base";

import {
  FEE,
  INITIAL_GAS_MULTIPLIER,
  RESEND_TX_TIMES,
  SQRT_PRICE_LIMIT_X96,
  UNWRAP_ETH_ADDRESS,
} from "./constants";

class PancakeSwapAction extends SwapAction {
  private readonly routerContractAddress: string;
  private readonly factoryContractAddress: string;
  private readonly quoteContractAddress: string;

  public constructor(params: { fromToken: Token; toToken: Token }) {
    super(params);

    this.initializeName({ provider: "PANCAKE" });

    this.routerContractAddress = this.getContractAddress({
      contractName: CONTRACT_PANCAKE_SWAP_ROUTER,
    });
    this.factoryContractAddress = this.getContractAddress({
      contractName: CONTRACT_PANCAKE_FACTORY,
    });
    this.quoteContractAddress = this.getContractAddress({
      contractName: CONTRACT_PANCAKE_QUOTE,
    });
  }

  private async getPool(params: {
    fromToken: Token;
    toToken: Token;
    isReversed?: boolean;
  }): Promise<string> {
    const { fromToken, toToken, isReversed } = params;
    const { chain } = fromToken;

    try {
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
        to: this.factoryContractAddress,
      });

      if (poolAddress === ethers.ZeroAddress) {
        throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
      }

      return poolAddress;
    } catch (error) {
      if (isReversed) throw error;
      return await this.getPool({
        fromToken: toToken,
        toToken: fromToken,
        isReversed: true,
      });
    }
  }

  private async getQuote(params: { normalizedAmount: Amount }) {
    const { normalizedAmount } = params;
    const { w3 } = this.fromToken.chain;

    const pancakeQuoteInterface = getEthersInterface({ name: "PancakeQuote" });

    const quoteExactInputSingleData = pancakeQuoteInterface.encodeFunctionData(
      "quoteExactInputSingle",
      [
        {
          tokenIn: this.fromToken.getAddressOrWrappedForNative(),
          tokenOut: this.toToken.getAddressOrWrappedForNative(),
          amountIn: normalizedAmount,
          fee: FEE,
          sqrtPriceLimitX96: SQRT_PRICE_LIMIT_X96,
        },
      ],
    );

    const quoteExactInputSingleResult = await w3.eth.call({
      data: quoteExactInputSingleData,
      to: this.quoteContractAddress,
    });

    const quote = pancakeQuoteInterface.decodeFunctionResult(
      "quoteExactInputSingle",
      quoteExactInputSingleResult,
    );

    const amountOut = quote.at(0);
    const gasEstimate = quote.at(3);

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
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
  }) {
    const { account, normalizedAmount, minOutNormalizedAmount } = params;

    const { chain } = this.fromToken;

    const pancakeRouterInterface = getEthersInterface({
      name: "PancakeSwapRouter",
    });

    const address = this.toToken.isNative
      ? UNWRAP_ETH_ADDRESS
      : account.address;

    const exactInputSingleData = pancakeRouterInterface.encodeFunctionData(
      "exactInputSingle",
      [
        {
          tokenIn: this.fromToken.getAddressOrWrappedForNative(),
          tokenOut: this.toToken.getAddressOrWrappedForNative(),
          fee: FEE,
          recipient: address,
          amountIn: normalizedAmount,
          amountOutMinimum: minOutNormalizedAmount,
          sqrtPriceLimitX96: SQRT_PRICE_LIMIT_X96,
        },
      ],
    );

    const multicallBytesArray = [exactInputSingleData];

    if (this.toToken.isNative) {
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

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    return await this.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: this.routerContractAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;

    const { chain } = this.fromToken;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const poolAddress = await this.getPool({
      fromToken: this.fromToken,
      toToken: this.toToken,
    });

    if (!poolAddress) {
      throw new Error(`pool not found`);
    }

    const { minOutNormalizedAmount, estimatedGas } = await this.getQuote({
      normalizedAmount,
    });

    const { data } = await this.getSwapData({
      account,
      normalizedAmount,
      minOutNormalizedAmount,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const value = this.fromToken.isNative ? normalizedAmount : 0;

    const tx: Transaction = {
      data,
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: this.routerContractAddress,
      value,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg, retryTimes: RESEND_TX_TIMES };
  }
}

export default PancakeSwapAction;
