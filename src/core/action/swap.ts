/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Amount } from "../../types";
import Account from "../account";
import Token from "../token";

import { DefaultActionResult, Provider } from "./types";

import Action from ".";
import Big from "big.js";

abstract class SwapAction extends Action {
  constructor(params: { provider: Provider }) {
    const { provider } = params;

    super({ provider, actionType: "SWAP" });
  }

  abstract getTransactions(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: Amount;
  }): Promise<DefaultActionResult>;

  protected async basicCheckIsAllowed(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    contractName: string;
  }) {
    const { account, fromToken, toToken, normalizedAmount, contractName } =
      params;

    const isTokenNotSame = !fromToken.isEquals(toToken);

    if (!isTokenNotSame) {
      throw new Error(`swap is not available for equal tokens`);
    }

    const isSameChains = !fromToken.chain.isEquals(toToken.chain);

    if (!isSameChains) {
      throw new Error(`swap is not available for tokens in different chains`);
    }

    const { chain } = fromToken;

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address,
    );

    const isBalanceAllowed = Big(normalizedBalance).gte(normalizedAmount);

    if (!isBalanceAllowed) {
      const readableBalance =
        await fromToken.toReadableAmount(normalizedBalance);

      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `balance is less than amount: ${readableBalance} < ${readableAmount}`,
      );
    }

    const contractAddress = chain.getContractAddressByName(contractName);

    if (!contractAddress) {
      throw new Error(`action is not available in ${chain}`);
    }

    return { contractAddress };
  }
}

export default SwapAction;
