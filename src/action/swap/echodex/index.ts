import { Transaction } from "web3";

import { CONTRACT_ECHO_DEX_SMART_ROUTER } from "../../../abi/constants/contracts";
import getEthersInterface from "../../../abi/methods/getEthersInterface";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import Account from "../../../core/account";
import { Amount } from "../../../types";
import SwapAction from "../base";

import Token from "../../../core/token";
import { UNWRAP_ETH_ADDRESS } from "./constants";

class EchoDexSwapAction extends SwapAction {
  private readonly contractAddress: string;

  public constructor(params: { fromToken: Token; toToken: Token }) {
    const { fromToken, toToken } = params;
    super({ fromToken, toToken, provider: "ECHO_DEX" });

    this.contractAddress = this.getContractAddress({
      contractName: CONTRACT_ECHO_DEX_SMART_ROUTER,
    });
  }

  private async getSwapData(params: {
    account: Account;
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
  }) {
    const { account, normalizedAmount, minOutNormalizedAmount } = params;
    const { chain } = this.fromToken;

    const echoDexRouterInterface = getEthersInterface({
      name: "EchoDexSmartRouter",
    });

    const address = this.toToken.isNative
      ? UNWRAP_ETH_ADDRESS
      : account.address;

    const swapExactTokensForTokensData =
      echoDexRouterInterface.encodeFunctionData("swapExactTokensForTokens", [
        normalizedAmount,
        minOutNormalizedAmount,
        [
          this.fromToken.getAddressOrWrappedForNative(),
          this.toToken.getAddressOrWrappedForNative(),
        ],
        address,
      ]);

    const multicallBytesArray = [swapExactTokensForTokensData];

    if (this.toToken.isNative) {
      const unwrapEthData = echoDexRouterInterface.encodeFunctionData(
        "unwrapWETH9",
        [minOutNormalizedAmount, account.address],
      );
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = echoDexRouterInterface.encodeFunctionData(
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

    return await EchoDexSwapAction.getDefaultApproveTransaction({
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
      to: this.contractAddress,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg };
  }
}

export default EchoDexSwapAction;
