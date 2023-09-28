import { CONTRACT_WOOFI_ROUTER } from "../../../abi/constants/contracts";
import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import SwapAction from "../base";

class WoofiSwapAction extends SwapAction {
  private readonly contractAddress: string;

  public constructor(params: { fromToken: Token; toToken: Token }) {
    const { fromToken, toToken } = params;
    super({ fromToken, toToken, provider: "WOOFI" });

    this.contractAddress = this.getContractAddress({
      contractName: CONTRACT_WOOFI_ROUTER,
    });
  }

  private getSwapCall(params: {
    account: Account;
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
  }) {
    const { account, normalizedAmount, minOutNormalizedAmount } = params;

    const { chain } = this.fromToken;
    const { w3 } = chain;

    const routerContract = getWeb3Contract({
      w3,
      name: CONTRACT_WOOFI_ROUTER,
      address: this.contractAddress,
    });

    return routerContract.methods.swap(
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

    return await WoofiSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: this.contractAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;

    const { chain } = this.fromToken;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const minOutNormalizedAmount = await this.toToken.getMinOutNormalizedAmount(
      this.fromToken,
      normalizedAmount,
      DEFAULT_SLIPPAGE_PERCENT,
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
      to: this.contractAddress,
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
