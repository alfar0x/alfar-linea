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
  MIN_OUT_SLIPPAGE_PERCENT,
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

  private async getPool(fromToken: Token, toToken: Token): Promise<string> {
    const { chain } = fromToken;

    const pancakeFactoryInterface = getEthersInterface({
      name: "PancakeFactory",
    });

    const getPoolData = pancakeFactoryInterface.encodeFunctionData("getPool", [
      fromToken.getAddressOrWrappedForNative(),
      toToken.getAddressOrWrappedForNative(),
      FEE,
    ]);

    const poolAddress = await chain.w3.eth.call({
      data: getPoolData,
      to: this.factoryContractAddress,
    });

    if (poolAddress !== ethers.ZeroAddress) return poolAddress;

    const reversedPoolAddress = await this.getPool(toToken, fromToken);

    if (reversedPoolAddress !== ethers.ZeroAddress) return reversedPoolAddress;

    throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
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
    const contractMinOutNormalizedAmount = Big(amount)
      .minus(slippageAmount)
      .round()
      .toString();

    const defaultMinOutNormalizedAmount =
      await this.toToken.getMinOutNormalizedAmount(
        this.fromToken,
        normalizedAmount,
        MIN_OUT_SLIPPAGE_PERCENT,
      );

    const isContractLess = Big(contractMinOutNormalizedAmount).lt(
      defaultMinOutNormalizedAmount,
    );

    const minOutNormalizedAmount = isContractLess
      ? contractMinOutNormalizedAmount
      : defaultMinOutNormalizedAmount;

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

    const poolAddress = await this.getPool(this.fromToken, this.toToken);

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
