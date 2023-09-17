import axios from "axios";
import Big from "big.js";
import Web3 from "web3";

import {
  DEFAULT_GAS_MULTIPLIER,
  DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
  DEFAULT_SLIPPAGE_PERCENT,
} from "../../../constants";
import { CONTRACT_XY_FINANCE_ROUTER } from "../../../constants/contractsWithoutAbi";
import Account from "../../../core/account";
import { SwapAction } from "../../../core/action/swap";
import Chain from "../../../core/chain";
import Token from "../../../core/token";
import sleep from "../../../utils/other/sleep";
import getRandomWalletAddress from "../../../utils/web3/getRandomWalletAddress";

import { API_URL } from "./constants";
import { XyFinanceBuildTx, XyFinanceQuote } from "./types";

class XyFinanceSwap extends SwapAction {
  constructor() {
    super({ provider: "XY_FINANCE" });
  }

  public getApproveAddress(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_XY_FINANCE_ROUTER);
  }

  async quoteRequest(params: {
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { fromToken, toToken, normalizedAmount } = params;

    const chainId = String(fromToken.chain.chainId);
    const searchParams = {
      srcChainId: chainId,
      srcQuoteTokenAddress: fromToken.address,
      srcQuoteTokenAmount: String(normalizedAmount),
      dstChainId: chainId,
      dstQuoteTokenAddress: toToken.address,
      slippage: String(DEFAULT_SLIPPAGE_PERCENT),
    };

    const urlParams = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/quote?${urlParams}`;

    const { data } = await axios.get<XyFinanceQuote>(url);

    if (!data.success) throw new Error(data.errorMsg || String(data.errorCode));

    if (!data.routes.length) {
      throw new Error(`Unexpected error. No routes available`);
    }

    const { srcSwapDescription, contractAddress } = data.routes[0];
    const { provider } = srcSwapDescription;

    return { provider, contractAddress };
  }

  private async buildTxRequest(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    provider: string;
  }) {
    const { account, fromToken, toToken, normalizedAmount, provider } = params;

    const randomWalletAddress = getRandomWalletAddress();

    const fullRandomAddress = Web3.utils.toChecksumAddress(
      `0x${randomWalletAddress}`,
    );

    const chainId = String(fromToken.chain.chainId);

    const searchParams = {
      srcChainId: chainId,
      srcQuoteTokenAddress: fromToken.address,
      srcQuoteTokenAmount: String(normalizedAmount),
      dstChainId: chainId,
      dstQuoteTokenAddress: toToken.address,
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

    return {
      data: contractData,
      to,
      value,
      estimatedGas,
      minOutNormalizedAmount: minReceiveAmount,
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

    const routerContractAddress = this.getApproveAddress(chain);

    if (!routerContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.isNative) {
      const normalizedAllowance = await fromToken.normalizedAllowance(
        account,
        routerContractAddress,
      );

      if (Big(normalizedAllowance).lt(normalizedAmount)) {
        const readableAllowance =
          await fromToken.toReadableAmount(normalizedAllowance);
        const readableAmount =
          await fromToken.toReadableAmount(normalizedAmount);

        throw new Error(
          `account ${fromToken} allowance is less than amount: ${readableAllowance} < ${readableAmount}`,
        );
      }
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`,
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

    return { routerContractAddress };
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
    const { routerContractAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const { provider, contractAddress } = await this.quoteRequest({
      fromToken,
      toToken,
      normalizedAmount,
    });

    if (contractAddress !== routerContractAddress) {
      throw new Error(
        `Unexpected error: contractAddress !== routerContractAddress: ${contractAddress} !== ${routerContractAddress}. Please contact developer`,
      );
    }

    await sleep(3);

    const { data, to, estimatedGas, minOutNormalizedAmount } =
      await this.buildTxRequest({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        provider,
      });

    if (to !== routerContractAddress) {
      throw new Error(
        `Unexpected error: to !== routerContractAddress: ${to} !== ${routerContractAddress}. Please contact developer`,
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
      to: routerContractAddress,
      value: normalizedAmount,
    };

    const hash = await account.signAndSendTransaction(chain, tx, {
      retry: {
        gasMultiplier: DEFAULT_GAS_MULTIPLIER,
        times: DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
      },
    });

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount,
    );

    return { hash, inReadableAmount, outReadableAmount };
  }
}

export default XyFinanceSwap;
