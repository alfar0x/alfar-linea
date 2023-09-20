/* eslint-disable no-unused-vars */
import { Amount } from "../../types";
import Account from "../account";
import Token from "../token";

import { DefaultActionResult, Provider } from "./types";

import Action from ".";

abstract class SupplyAction extends Action {
  constructor(params: { provider: Provider }) {
    const { provider } = params;

    super({ provider, actionType: "SUPPLY" });
  }

  abstract supply(params: {
    account: Account;
    token: Token;
    normalizedAmount: Amount;
  }): Promise<DefaultActionResult>;

  abstract redeemAll(params: {
    account: Account;
    token: Token;
  }): Promise<DefaultActionResult>;
}

export default SupplyAction;
