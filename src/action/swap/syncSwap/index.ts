import { ethers } from "ethers";
import { Transaction } from "web3";

import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import SwapAction from "../base";

import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import config from "./config";
import { SwapPath, SwapStep } from "./types";

class SyncswapSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "SYNCSWAP" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private async getPool(fromToken: Token, toToken: Token): Promise<string> {
    const { chain } = fromToken;
    const { factoryAddress, factoryContract } = this.config;

    const poolAddress = await factoryContract(chain.w3, factoryAddress)
      .methods.getPool(
        fromToken.getAddressOrWrappedForNative(),
        toToken.getAddressOrWrappedForNative(),
      )
      .call();

    if (poolAddress !== ethers.ZeroAddress) return poolAddress;

    const reversedPoolAddress = await this.getPool(toToken, fromToken);

    if (reversedPoolAddress !== ethers.ZeroAddress) return reversedPoolAddress;

    throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
  }

  private async getSwapCall(params: {
    account: Account;
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
    poolAddress: string;
  }) {
    const { account, normalizedAmount, minOutNormalizedAmount, poolAddress } =
      params;

    const { withdrawalMode, routerAddress, routerContract } = this.config;

    const { chain } = this.fromToken;

    const encoder = new ethers.AbiCoder();

    const swapData = encoder.encode(
      ["address", "address", "uint8"],
      [
        this.fromToken.getAddressOrWrappedForNative(),
        account.address,
        withdrawalMode.withdrawEth,
      ],
    );

    const step: SwapStep = [poolAddress, swapData, ethers.ZeroAddress, "0x"];

    const tokenIn = this.fromToken.isNative
      ? ethers.ZeroAddress
      : this.fromToken.address;

    const path: SwapPath = [[step], tokenIn, normalizedAmount];

    const deadline = await chain.getSwapDeadline();

    return routerContract(chain.w3, routerAddress).methods.swap(
      [path],
      minOutNormalizedAmount,
      deadline,
    );
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { routerAddress } = this.config;

    return await SyncswapSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: routerAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
    const { routerAddress, slippagePercent } = this.config;

    const { chain } = this.fromToken;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const poolAddress = await this.getPool(this.fromToken, this.toToken);

    if (!poolAddress) {
      throw new Error(`pool not found`);
    }

    const minOutNormalizedAmount = await this.toToken.getMinOutNormalizedAmount(
      this.fromToken,
      normalizedAmount,
      slippagePercent,
    );

    const swapFunctionCall = await this.getSwapCall({
      account,
      normalizedAmount,
      minOutNormalizedAmount,
      poolAddress,
    });

    const value = this.fromToken.isNative ? normalizedAmount : 0;

    const estimatedGas = await swapFunctionCall.estimateGas({
      from: account.address,
      value,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx: Transaction = {
      data: swapFunctionCall.encodeABI(),
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

    return { tx, resultMsg };
  }
}

export default SyncswapSwapAction;
