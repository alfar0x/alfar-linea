import { Amount } from "../types";

import Account from "./account";
import ActionContext from "./actionContext";
import Token from "./token";
import { CreateTransactionResult } from "./transaction";

export type DefaultActionFunctionResult = CreateTransactionResult;

abstract class Action {
  public readonly id: string;
  protected readonly context: ActionContext;

  protected constructor(params: {
    context: ActionContext;
    chainName: string;
    action: string;
    operation: string;
    provider: string;
  }) {
    const { context, chainName, action, provider, operation } = params;

    this.id = [chainName, action, provider, operation].join(":");
    this.context = context;
  }

  protected getTxName(name: string) {
    return `${this.id}#tx-${name}`;
  }

  protected static async getDefaultApproveTransaction(params: {
    account: Account;
    token: Token;
    spenderAddress: string;
    normalizedAmount: Amount;
  }): Promise<DefaultActionFunctionResult> {
    const { account, token, spenderAddress, normalizedAmount } = params;
    const tx = await token.getApproveTransaction({
      account,
      spenderAddress,
      normalizedAmount,
    });

    const readableAmount = await token.toReadableAmount(normalizedAmount);

    return { tx, resultMsg: `${readableAmount} ${token} approved` };
  }

  public toString() {
    return this.id;
  }
}

export default Action;
