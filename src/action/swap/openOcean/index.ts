import axios from "axios";
import { Transaction } from "web3";

import Big from "big.js";
import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import randomWalletAddress from "../../../utils/random/randomWalletAddress";
import SwapAction from "../base";

import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";
import formatUrlParams from "../../../utils/formatters/formatUrlParams";
import logger from "../../../utils/other/logger";
import formatObject from "../../../utils/formatters/formatObject";
import { OpenOceanSwapQuote } from "./types";
import config from "./config";

class OpenOceanSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "OPEN_OCEAN" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private async swapQuoteRequest(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const { apiUrl, routerAddress, slippagePercent, initialGasMultiplier } =
      this.config;

    const randomAddress = randomWalletAddress();

    const fullRandomAddress = formatToChecksum(`0x${randomAddress}`);

    const readableAmount = await this.fromToken.toReadableAmount(
      normalizedAmount,
      true,
    );
    const gasPrice = await this.fromToken.chain.w3.eth.getGasPrice();

    const searchParams = {
      inTokenAddress: this.fromToken.address,
      outTokenAddress: this.toToken.address,
      amount: readableAmount,
      gasPrice: gasPrice.toString(),
      slippage: slippagePercent,
      account: fullRandomAddress,
    };

    const urlParams = formatUrlParams(searchParams).toString();
    const url = `${apiUrl}/swap_quote?${urlParams}`;

    const { data } = await axios.get<OpenOceanSwapQuote>(url);

    if (data.code !== 200) throw new Error(data.errorMsg || data.error);

    const { to, value, estimatedGas, minOutAmount } = data.data;

    logger.silly(formatObject({ to, value, estimatedGas, minOutAmount }));

    if (to !== routerAddress) {
      throw new Error(`to !== routerAddress: ${to} !== ${routerAddress}`);
    }

    const addressToChangeTo = account.address.toLocaleLowerCase().substring(2);

    const contractData = data.data.data.replaceAll(
      randomAddress,
      addressToChangeTo,
    );

    return {
      data: contractData,
      to,
      value,
      estimatedGas: Big(estimatedGas)
        .times(initialGasMultiplier)
        .round()
        .toString(),
      minOutNormalizedAmount: minOutAmount,
    };
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { routerAddress } = this.config;

    return await OpenOceanSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: routerAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;

    const { chain } = this.fromToken;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const { data, to, value, estimatedGas, minOutNormalizedAmount } =
      await this.swapQuoteRequest({
        account,
        normalizedAmount,
      });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx: Transaction = {
      data,
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to,
      value,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg };
  }
}

export default OpenOceanSwapAction;
