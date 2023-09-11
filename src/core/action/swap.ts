/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Amount } from "../../types";
import Account from "../account";
import Chain from "../chain";
import Token from "../token";

import { Provider } from "./types";

import Action from ".";

export abstract class SwapAction extends Action {
  constructor(params: { provider: Provider }) {
    const { provider } = params;

    super({ provider, actionType: "SWAP" });
  }

  abstract swap(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: Amount;
  }): Promise<{
    hash: string;
    inReadableAmount: Amount;
    outReadableAmount: Amount;
  }>;

  getApproveAddress(chain: Chain): string | undefined {
    throw new Error("Method is not implemented");
  }
}
