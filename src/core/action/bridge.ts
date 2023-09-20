/* eslint-disable no-unused-vars */
import { Amount } from "../../types";
import Account from "../account";
import Token from "../token";

import { DefaultActionResult, Provider } from "./types";

import Action from ".";

abstract class BridgeAction extends Action {
  constructor(params: { provider: Provider }) {
    const { provider } = params;

    super({ provider, actionType: "BRIDGE" });
  }

  abstract bridge(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: Amount;
  }): Promise<DefaultActionResult>;
}

export default BridgeAction;
