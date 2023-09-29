import axios from "axios";

import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import sleep from "../../../utils/other/sleep";
import randomWalletAddress from "../../../utils/random/randomWalletAddress";
import SwapAction from "../base";

import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import formatUrlParams from "../../../utils/formatters/formatUrlParams";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";
import { XyFinanceBuildTx, XyFinanceQuote } from "./types";
import config from "./config";

class XyFinanceSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "XY_FINANCE" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private async quoteRequest(params: { normalizedAmount: Amount }) {
    const { normalizedAmount } = params;
    const { slippagePercent, apiUrl, routerAddress } = this.config;

    const { chainId } = this.fromToken.chain;

    const searchParams = {
      srcChainId: chainId,
      srcQuoteTokenAddress: this.fromToken.address,
      srcQuoteTokenAmount: normalizedAmount,
      dstChainId: chainId,
      dstQuoteTokenAddress: this.toToken.address,
      slippage: slippagePercent,
    };

    const urlParams = formatUrlParams(searchParams);
    const url = `${apiUrl}/quote?${urlParams}`;

    const { data } = await axios.get<XyFinanceQuote>(url);

    if (!data.success)
      throw new Error(
        data.errorMsg ||
          `unexpected error. xy finance api response is not success`,
      );

    if (!data.routes.length) {
      throw new Error(`unexpected error. No routes available`);
    }

    const { srcSwapDescription, contractAddress } = data.routes[0];
    const { provider } = srcSwapDescription;

    if (contractAddress !== routerAddress) {
      throw new Error(
        `unexpected error. contractAddress !== routerAddress: ${contractAddress} !== ${routerAddress}`,
      );
    }

    return { provider, contractAddress };
  }

  private async buildTxRequest(params: {
    account: Account;
    normalizedAmount: Amount;
    provider: string;
  }) {
    const { account, normalizedAmount, provider } = params;
    const { slippagePercent, apiUrl, routerAddress } = this.config;

    const randomAddress = randomWalletAddress();

    const fullRandomAddress = formatToChecksum(`0x${randomAddress}`);

    const { chainId } = this.fromToken.chain;

    const searchParams = {
      srcChainId: chainId,
      srcQuoteTokenAddress: this.fromToken.address,
      srcQuoteTokenAmount: normalizedAmount,
      dstChainId: chainId,
      dstQuoteTokenAddress: this.toToken.address,
      slippage: slippagePercent,
      receiver: fullRandomAddress,
      srcSwapProvider: provider,
    };

    const urlParams = formatUrlParams(searchParams);
    const url = `${apiUrl}/buildTx?${urlParams}`;

    const { data } = await axios.get<XyFinanceBuildTx>(url);

    if (!data.success) throw new Error(data.errorMsg || String(data.errorCode));

    const { minReceiveAmount, estimatedGas } = data.route;
    const { to, value } = data.tx;

    const addressToChangeTo = account.address.toLocaleLowerCase().substring(2);

    const contractData = data.tx.data.replaceAll(
      randomAddress,
      addressToChangeTo,
    );

    if (to !== routerAddress) {
      throw new Error(
        `unexpected error. to !== contractAddress: ${to} !== ${routerAddress}`,
      );
    }

    return {
      data: contractData,
      to,
      value,
      estimatedGas,
      minOutNormalizedAmount: minReceiveAmount,
    };
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { routerAddress } = this.config;

    return await XyFinanceSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: routerAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
    const { resendTxTimes } = this.config;

    const { chain } = this.fromToken;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const { provider } = await this.quoteRequest({ normalizedAmount });

    const sleepBetweenApiRequestsSec = 5;

    await sleep(sleepBetweenApiRequestsSec);

    const { data, to, estimatedGas, minOutNormalizedAmount } =
      await this.buildTxRequest({
        account,
        normalizedAmount,
        provider,
      });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data,
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to,
      value: normalizedAmount,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg, retryTimes: resendTxTimes };
  }
}

export default XyFinanceSwapAction;
