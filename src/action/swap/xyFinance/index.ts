import axios from "axios";
import Web3 from "web3";

import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import { CONTRACT_XY_FINANCE_ROUTER } from "../../../constants/contractsWithoutAbi";
import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import sleep from "../../../utils/other/sleep";
import getRandomWalletAddress from "../../../utils/web3/getRandomWalletAddress";
import SwapAction from "../base";

import { API_URL, RESEND_TX_TIMES } from "./constants";
import { XyFinanceBuildTx, XyFinanceQuote } from "./types";

class XyFinanceSwapAction extends SwapAction {
  private contractAddress: string;

  public constructor(params: { fromToken: Token; toToken: Token }) {
    super(params);

    this.initializeName({ provider: "XY_FINANCE" });

    this.contractAddress = this.getContractAddress({
      contractName: CONTRACT_XY_FINANCE_ROUTER,
    });
  }

  private async quoteRequest(params: { normalizedAmount: Amount }) {
    const { normalizedAmount } = params;

    const chainId = String(this.fromToken.chain.chainId);
    const searchParams = {
      srcChainId: chainId,
      srcQuoteTokenAddress: this.fromToken.address,
      srcQuoteTokenAmount: String(normalizedAmount),
      dstChainId: chainId,
      dstQuoteTokenAddress: this.toToken.address,
      slippage: String(DEFAULT_SLIPPAGE_PERCENT),
    };

    const urlParams = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/quote?${urlParams}`;

    const { data } = await axios.get<XyFinanceQuote>(url);

    if (!data.success) throw new Error(data.errorMsg || String(data.errorCode));

    if (!data.routes.length) {
      throw new Error(`unexpected error. No routes available`);
    }

    const { srcSwapDescription, contractAddress } = data.routes[0];
    const { provider } = srcSwapDescription;

    if (contractAddress !== this.contractAddress) {
      throw new Error(
        `contractAddress !== this.contractAddress: ${contractAddress} !== ${this.contractAddress}. Please contact developer`,
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

    const randomWalletAddress = getRandomWalletAddress();

    const fullRandomAddress = Web3.utils.toChecksumAddress(
      `0x${randomWalletAddress}`,
    );

    const chainId = String(this.fromToken.chain.chainId);

    const searchParams = {
      srcChainId: chainId,
      srcQuoteTokenAddress: this.fromToken.address,
      srcQuoteTokenAmount: String(normalizedAmount),
      dstChainId: chainId,
      dstQuoteTokenAddress: this.toToken.address,
      slippage: String(DEFAULT_SLIPPAGE_PERCENT),
      receiver: fullRandomAddress,
      srcSwapProvider: provider,
    };

    const urlParams = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/buildTx?${urlParams}`;

    const { data } = await axios.get<XyFinanceBuildTx>(url);

    if (!data.success) throw new Error(data.errorMsg || String(data.errorCode));

    const { minReceiveAmount, estimatedGas } = data.route;
    const { to, value } = data.tx;

    const addressToChangeTo = account.address.toLocaleLowerCase().substring(2);

    const contractData = data.tx.data.replaceAll(
      randomWalletAddress,
      addressToChangeTo,
    );

    if (to !== this.contractAddress) {
      throw new Error(
        `unexpected error: to !== contractAddress: ${to} !== ${this.contractAddress}. Please contact developer`,
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

    return await this.getDefaultApproveTransaction({
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

    const { provider } = await this.quoteRequest({
      normalizedAmount,
    });

    await sleep(5);

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

    return { tx, resultMsg, retryTimes: RESEND_TX_TIMES };
  }
}

export default XyFinanceSwapAction;
