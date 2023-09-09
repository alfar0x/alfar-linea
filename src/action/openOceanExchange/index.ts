import axios from "axios";
import Big from "big.js";
import Web3 from "web3";

import {
  ACTION_OPEN_OCEAN_SWAP,
  CONTRACT_OPEN_OCEAN_EXCHANGE,
  SLIPPAGE_PERCENT,
} from "../../constants";
import Account from "../../core/account";
import Action from "../../core/action";
import Chain from "../../core/chain";
import Token from "../../core/token";

import { chainData } from "./chainData";
import { OpenOceanSwapQuote } from "./types";

class OpenOceanExchange extends Action {
  name = ACTION_OPEN_OCEAN_SWAP;
  url = "https://open-api.openocean.finance/v3";

  public getAddressToApprove(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_OPEN_OCEAN_EXCHANGE);
  }

  private getRandomWalletAddress() {
    const addressLength = 40;

    const symbols = "abcdef0123456789";

    const randomWalletAddress = Array.from({ length: addressLength }, () => {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      return symbols.charAt(randomIndex);
    });

    return randomWalletAddress.join("");
  }

  async swapQuoteRequest(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    chainPath: string;
  }) {
    const { account, fromToken, toToken, normalizedAmount, chainPath } = params;

    const randomWalletAddress = this.getRandomWalletAddress();

    const fullRandomAddress = Web3.utils.toChecksumAddress(
      "0x" + randomWalletAddress
    );

    const readableAmount = await fromToken.toReadableAmount(
      normalizedAmount,
      true
    );
    const gasPrice = await fromToken.chain.w3.eth.getGasPrice();

    const searchParams = {
      inTokenAddress: fromToken.address,
      outTokenAddress: toToken.address,
      amount: readableAmount,
      gasPrice: gasPrice.toString(),
      slippage: String(SLIPPAGE_PERCENT),
      account: fullRandomAddress,
    };

    const urlParams = new URLSearchParams(searchParams).toString();
    const url = `${this.url}/${chainPath}/swap_quote?${urlParams}`;

    const { data } = await axios.get<OpenOceanSwapQuote>(url);

    if (data.code !== 200) throw new Error(data.errorMsg || data.error);

    const { to, value, estimatedGas, minOutAmount } = data.data;

    const addressToChangeTo = account.address.toLocaleLowerCase().substring(2);

    const contractData = data.data.data.replaceAll(
      randomWalletAddress,
      addressToChangeTo
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

    const { chainPath } = chainData[chain.chainId] || {};

    const exchangeContractAddress = this.getAddressToApprove(chain);

    if (!chainPath || !exchangeContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.isNative) {
      const normalizedAllowance = await fromToken.normalizedAllowance(
        account,
        exchangeContractAddress
      );

      if (Big(normalizedAllowance).lt(normalizedAmount)) {
        const readableAllowance = await fromToken.toReadableAmount(
          normalizedAllowance
        );
        const readableAmount = await fromToken.toReadableAmount(
          normalizedAmount
        );

        throw new Error(
          `account ${fromToken} allowance is less than amount: ${readableAllowance} < ${readableAmount}`
        );
      }
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `pancake is not available for tokens in different chains: ${fromToken} -> ${toToken}`
      );
    }

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address
    );

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance = await fromToken.toReadableAmount(
        normalizedBalance
      );
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${fromToken} balance is less than amount: ${readableBalance} < ${readableAmount}`
      );
    }

    return { chainPath, exchangeContractAddress };
  }

  async swap(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chain } = fromToken;
    const { w3 } = chain;
    const { chainPath, exchangeContractAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const { data, to, value, estimatedGas, minOutNormalizedAmount } =
      await this.swapQuoteRequest({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        chainPath,
      });

    if (to !== exchangeContractAddress) {
      throw new Error(
        `Unexpected error: to !== exchangeContractAddress: ${to} !== ${exchangeContractAddress}. Please contact developer`
      );
    }

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data,
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: exchangeContractAddress,
      value,
    };

    const hash = await account.signAndSendTransaction(chain, tx);

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount
    );

    return { hash, inReadableAmount, outReadableAmount };
  }
}

export default OpenOceanExchange;
