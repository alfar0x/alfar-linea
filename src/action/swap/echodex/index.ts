import { Transaction } from "web3";

import Account from "../../../core/account";
import { Amount } from "../../../types";
import SwapAction from "../base";

import Token from "../../../core/token";
import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import config from "./config";

class EchoDexSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "ECHO_DEX" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private async getSwapData(params: {
    account: Account;
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
  }) {
    const { account, normalizedAmount, minOutNormalizedAmount } = params;
    const { chain } = this.fromToken;
    const { routerInterface, unwrapEthAddress } = this.config;

    const address = this.toToken.isNative ? unwrapEthAddress : account.address;

    const swapExactTokensForTokensData = routerInterface.encodeFunctionData(
      "swapExactTokensForTokens",
      [
        normalizedAmount,
        minOutNormalizedAmount,
        [
          this.fromToken.getAddressOrWrappedForNative(),
          this.toToken.getAddressOrWrappedForNative(),
        ],
        address,
      ],
    );

    const multicallBytesArray = [swapExactTokensForTokensData];

    if (this.toToken.isNative) {
      const unwrapEthData = routerInterface.encodeFunctionData("unwrapWETH9", [
        minOutNormalizedAmount,
        account.address,
      ]);
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = routerInterface.encodeFunctionData(
      "multicall(uint256,bytes[])",
      [deadline, multicallBytesArray],
    );

    return { data };
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { routerAddress } = this.config;

    return await EchoDexSwapAction.getDefaultApproveTransaction({
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

    const minOutNormalizedAmount = await this.toToken.getMinOutNormalizedAmount(
      this.fromToken,
      normalizedAmount,
      slippagePercent,
    );

    const { data } = await this.getSwapData({
      account,
      normalizedAmount,
      minOutNormalizedAmount,
    });

    const value = this.fromToken.isNative ? normalizedAmount : 0;

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const estimatedGas = "200000"; // @TODO estimate gas

    const tx: Transaction = {
      data,
      from: account.address,
      value,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: routerAddress,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg };
  }
}

export default EchoDexSwapAction;
