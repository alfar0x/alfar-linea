import axios from "axios";
import Big from "big.js";
import Web3 from "web3";

import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import { CONTRACT_OPEN_OCEAN_EXCHANGE } from "../../../constants/contractsWithoutAbi";
import Account from "../../../core/account";
import SwapAction from "../../../core/action/swap";
import Token from "../../../core/token";
import getRandomWalletAddress from "../../../utils/web3/getRandomWalletAddress";

import { API_URL, CHAINS_DATA } from "./constants";
import { OpenOceanSwapQuote } from "./types";
import RunnableTransaction from "../../../core/transaction";

class OpenOceanSwapAction extends SwapAction {
  constructor() {
    super({ provider: "OPEN_OCEAN" });
  }

  private async swapQuoteRequest(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    chainPath: string;
  }) {
    const { account, fromToken, toToken, normalizedAmount, chainPath } = params;

    const randomWalletAddress = getRandomWalletAddress();

    const fullRandomAddress = Web3.utils.toChecksumAddress(
      `0x${randomWalletAddress}`,
    );

    const readableAmount = await fromToken.toReadableAmount(
      normalizedAmount,
      true,
    );
    const gasPrice = await fromToken.chain.w3.eth.getGasPrice();

    const searchParams = {
      inTokenAddress: fromToken.address,
      outTokenAddress: toToken.address,
      amount: readableAmount,
      gasPrice: gasPrice.toString(),
      slippage: String(DEFAULT_SLIPPAGE_PERCENT),
      account: fullRandomAddress,
    };

    const urlParams = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/${chainPath}/swap_quote?${urlParams}`;

    const { data } = await axios.get<OpenOceanSwapQuote>(url);

    if (data.code !== 200) throw new Error(data.errorMsg || data.error);

    const { to, value, estimatedGas, minOutAmount } = data.data;

    const addressToChangeTo = account.address.toLocaleLowerCase().substring(2);

    const contractData = data.data.data.replaceAll(
      randomWalletAddress,
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

  private async checkIsAllowed(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chain } = fromToken;

    const { chainPath } = CHAINS_DATA[chain.chainId] || {};

    const contractAddress = chain.getContractAddressByName(
      CONTRACT_OPEN_OCEAN_EXCHANGE,
    );

    if (!chainPath || !contractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`,
      );
    }

    if (fromToken.isEquals(toToken)) {
      throw new Error(
        `action is not available for eq tokens: ${fromToken} -> ${toToken}`,
      );
    }

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address,
    );

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance =
        await fromToken.toReadableAmount(normalizedBalance);
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${fromToken} balance is less than amount: ${readableBalance} < ${readableAmount}`,
      );
    }

    return { chainPath, contractAddress };
  }

  private async getSwapTransaction(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    chainPath: string;
    contractAddress: string;
  }) {
    const {
      account,
      fromToken,
      toToken,
      normalizedAmount,
      chainPath,
      contractAddress,
    } = params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const { data, to, value, estimatedGas, minOutNormalizedAmount } =
      await this.swapQuoteRequest({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        chainPath,
      });

    if (to !== contractAddress) {
      throw new Error(`to !== contractAddress: ${to} !== ${contractAddress}`);
    }

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const swapTx = {
      data,
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: contractAddress,
      value,
    };

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount,
    );

    return { swapTx, inReadableAmount, outReadableAmount };
  }

  async swap(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chainPath, contractAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const txs: RunnableTransaction[] = [];

    const approveTx = await fromToken.getApproveTransaction({
      account,
      spenderAddress: contractAddress,
      normalizedAmount,
    });

    if (approveTx) {
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);
      txs.push(
        new RunnableTransaction({
          name: "approve",
          chain: fromToken.chain,
          account,
          tx: approveTx,
          resultMsg: `${readableAmount} ${fromToken} success`,
        }),
      );
    }

    const { swapTx, inReadableAmount, outReadableAmount } =
      await this.getSwapTransaction({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        chainPath,
        contractAddress,
      });

    txs.push(
      new RunnableTransaction({
        name: "swap",
        chain: fromToken.chain,
        account,
        tx: swapTx,
        resultMsg: `${inReadableAmount} ${fromToken} -> ${outReadableAmount} ${toToken} success`,
      }),
    );

    return { txs };
  }
}

export default OpenOceanSwapAction;
