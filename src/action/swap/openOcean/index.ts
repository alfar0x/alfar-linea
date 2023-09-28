import axios from "axios";
import { Web3, Transaction } from "web3";

import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import { CONTRACT_OPEN_OCEAN_EXCHANGE } from "../../../constants/contractsWithoutAbi";
import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import randomWalletAddress from "../../../utils/random/randomWalletAddress";
import SwapAction from "../base";

import ActionContext from "../../../core/actionContext";
import { API_URL, CHAINS_DATA } from "./constants";
import { OpenOceanSwapQuote } from "./types";

class OpenOceanSwapAction extends SwapAction {
  private readonly contractAddress: string;
  private readonly chainPath: string;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    const { fromToken, toToken, context } = params;
    super({ fromToken, toToken, provider: "OPEN_OCEAN", context });

    this.contractAddress = this.getContractAddress({
      contractName: CONTRACT_OPEN_OCEAN_EXCHANGE,
    });
    this.chainPath = this.getChainPath();
  }

  private getChainPath() {
    const chainPath = CHAINS_DATA[this.fromToken.chain.chainId]?.chainPath;

    if (!chainPath) {
      throw new Error(`chain path action is not available`);
    }

    return chainPath;
  }

  private async swapQuoteRequest(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const randomAddress = randomWalletAddress();

    const fullRandomAddress = Web3.utils.toChecksumAddress(
      `0x${randomAddress}`,
    );

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
      slippage: String(DEFAULT_SLIPPAGE_PERCENT),
      account: fullRandomAddress,
    };

    const urlParams = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/${this.chainPath}/swap_quote?${urlParams}`;

    const { data } = await axios.get<OpenOceanSwapQuote>(url);

    if (data.code !== 200) throw new Error(data.errorMsg || data.error);

    const { to, value, estimatedGas, minOutAmount } = data.data;

    if (to !== this.contractAddress) {
      throw new Error(
        `to !== contractAddress: ${to} !== ${this.contractAddress}`,
      );
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
      estimatedGas,
      minOutNormalizedAmount: minOutAmount,
    };
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    return await OpenOceanSwapAction.getDefaultApproveTransaction({
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
