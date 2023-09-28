import Account from "../../../core/account";
import { ChainConfig } from "../../../core/actionConfig";
import ActionContext from "../../../core/actionContext";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import SwapAction from "../base";
import config from "./config";

class WoofiSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "WOOFI" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private getSwapCall(params: {
    account: Account;
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
  }) {
    const { account, normalizedAmount, minOutNormalizedAmount } = params;
    const { routerAddress, routerContract } = this.config;

    const { w3 } = this.fromToken.chain;

    return routerContract(w3, routerAddress).methods.swap(
      this.fromToken.address,
      this.toToken.address,
      normalizedAmount,
      minOutNormalizedAmount,
      account.address,
      account.address,
    );
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { routerAddress } = this.config;

    return await WoofiSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: routerAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
    const { slippagePercent, routerAddress } = this.config;

    const { w3 } = this.fromToken.chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const minOutNormalizedAmount = await this.toToken.getMinOutNormalizedAmount(
      this.fromToken,
      normalizedAmount,
      slippagePercent,
    );

    const swapFunctionCall = this.getSwapCall({
      account,
      normalizedAmount,
      minOutNormalizedAmount,
    });

    const value = this.fromToken.isNative ? normalizedAmount : 0;

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

export default WoofiSwapAction;
