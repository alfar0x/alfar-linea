import Big from "big.js";
import { ethers } from "ethers";
import { Transaction } from "web3";

import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import SwapAction from "../base";

import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import config from "./config";

class PancakeSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "PANCAKE" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private async getPool(fromToken: Token, toToken: Token): Promise<string> {
    const { chain } = fromToken;
    const { fee, factoryAddress, factoryInterface } = this.config;

    const getPoolData = factoryInterface.encodeFunctionData("getPool", [
      fromToken.getAddressOrWrappedForNative(),
      toToken.getAddressOrWrappedForNative(),
      fee,
    ]);

    const poolAddress = await chain.w3.eth.call({
      data: getPoolData,
      to: factoryAddress,
    });

    if (poolAddress !== ethers.ZeroAddress) return poolAddress;

    const reversedPoolAddress = await this.getPool(toToken, fromToken);

    if (reversedPoolAddress !== ethers.ZeroAddress) return reversedPoolAddress;

    throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
  }

  private async getQuote(params: { normalizedAmount: Amount }) {
    const { normalizedAmount } = params;
    const { w3 } = this.fromToken.chain;
    const {
      fee,
      quoteAddress,
      quoteInterface,
      sqrtPriceLimitX96,
      minOutSlippagePercent,
      initialGasMultiplier,
      slippagePercent,
    } = this.config;

    const quoteExactInputSingleData = quoteInterface.encodeFunctionData(
      "quoteExactInputSingle",
      [
        {
          tokenIn: this.fromToken.getAddressOrWrappedForNative(),
          tokenOut: this.toToken.getAddressOrWrappedForNative(),
          amountIn: normalizedAmount,
          fee,
          sqrtPriceLimitX96,
        },
      ],
    );

    const quoteExactInputSingleResult = await w3.eth.call({
      data: quoteExactInputSingleData,
      to: quoteAddress,
    });

    const quote = quoteInterface.decodeFunctionResult(
      "quoteExactInputSingle",
      quoteExactInputSingleResult,
    );

    const amountOut = quote.at(0);
    const gasEstimate = quote.at(3);

    const amount = amountOut.toString();
    const slippageAmount = Big(amount).times(slippagePercent).div(100);

    const contractMinOutNormalizedAmount = Big(amount)
      .minus(slippageAmount)
      .round()
      .toString();

    const defaultMinOutNormalizedAmount =
      await this.toToken.getMinOutNormalizedAmount(
        this.fromToken,
        normalizedAmount,
        minOutSlippagePercent,
      );

    const isContractLess = Big(contractMinOutNormalizedAmount).lt(
      defaultMinOutNormalizedAmount,
    );

    const minOutNormalizedAmount = isContractLess
      ? contractMinOutNormalizedAmount
      : defaultMinOutNormalizedAmount;

    const estimatedGas = Big(gasEstimate.toString())
      .times(initialGasMultiplier)
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
    const { unwrapEthAddress, fee, sqrtPriceLimitX96, routerInterface } =
      this.config;

    const { chain } = this.fromToken;

    const address = this.toToken.isNative ? unwrapEthAddress : account.address;

    const exactInputSingleData = routerInterface.encodeFunctionData(
      "exactInputSingle",
      [
        {
          tokenIn: this.fromToken.getAddressOrWrappedForNative(),
          tokenOut: this.toToken.getAddressOrWrappedForNative(),
          fee,
          recipient: address,
          amountIn: normalizedAmount,
          amountOutMinimum: minOutNormalizedAmount,
          sqrtPriceLimitX96,
        },
      ],
    );

    const multicallBytesArray = [exactInputSingleData];

    if (this.toToken.isNative) {
      const unwrapEthData = routerInterface.encodeFunctionData("unwrapWETH9", [
        minOutNormalizedAmount,
        account.address,
      ]);
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = routerInterface.encodeFunctionData("multicall", [
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
    const { routerAddress } = this.config;

    return await PancakeSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: routerAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
    const { routerAddress, resendTxTimes } = this.config;

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
      to: routerAddress,
      value,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg, retryTimes: resendTxTimes };
  }
}

export default PancakeSwapAction;
