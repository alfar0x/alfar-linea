/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { Amount } from "../../types";
import Account from "../account";
import Chain from "../chain";
import Token from "../token";

import { Provider } from "./types";

import Action from ".";

export class SupplyAction extends Action {
  constructor(params: { provider: Provider }) {
    const { provider } = params;

    super({ provider, actionType: "SUPPLY" });
  }

  supply(params: {
    account: Account;
    token: Token;
    normalizedAmount: Amount;
  }): Promise<{
    hash: string;
    inReadableAmount: Amount;
  }> {
    throw new Error("Method is not implemented");
  }
  redeemAll(params: { account: Account; token: Token }): Promise<{
    hash: string;
    outReadableAmount: Amount;
  }> {
    throw new Error("Method is not implemented");
  }

  getApproveAddress(chain: Chain): string | undefined {
    throw new Error("Method is not implemented");
  }
}
