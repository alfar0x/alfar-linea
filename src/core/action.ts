import ACTION_PROVIDERS from "../constants/actionProviders";
import ACTION_TYPES from "../constants/actionTypes";
import { Amount } from "../types";

import Account from "./account";
import ActionContext from "./actionContext";
import Chain from "./chain";
import Token from "./token";
import { CreateTransactionResult } from "./transaction";

export type Provider = (typeof ACTION_PROVIDERS)[number];

export type ActionType = (typeof ACTION_TYPES)[number];

export type DefaultActionFunctionResult = CreateTransactionResult;

abstract class Action {
  private readonly actionType: ActionType;
  private readonly provider: Provider;
  private readonly operation: string;

  protected readonly context: ActionContext;

  protected constructor(params: {
    actionType: ActionType;
    provider: Provider;
    operation: string;
    context: ActionContext;
  }) {
    const { actionType, provider, operation, context } = params;

    this.actionType = actionType;
    this.provider = provider;
    this.operation = operation;

    this.context = context;
  }

  public get name() {
    return `${this.provider}_${this.actionType}_${this.operation}`.toUpperCase();
  }

  protected getTxName(name: string) {
    return `${this.name}-${name}`;
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

  protected static getDefaultContractAddress(params: {
    contractName: string;
    chain: Chain;
  }) {
    const { chain, contractName } = params;

    const contractAddress = chain.getContractAddressByName(contractName);

    if (!contractAddress) {
      throw new Error(`action is not available in ${chain}`);
    }

    return contractAddress;
  }

  public toString() {
    return this.name;
  }
}

export default Action;
