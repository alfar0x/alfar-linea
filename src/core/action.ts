import ACTION_PROVIDERS from "../constants/actionProviders";
import ACTION_TYPES from "../constants/actionTypes";
import { Amount } from "../types";

import Account from "./account";
import Chain from "./chain";
import Token from "./token";
import { CreateTransactionResult } from "./transaction";

export type Provider = (typeof ACTION_PROVIDERS)[number];

export type ActionType = (typeof ACTION_TYPES)[number];

export type DefaultActionFunctionResult = CreateTransactionResult;

abstract class Action {
  private _actionType?: ActionType;
  private _provider?: Provider;
  private _operation?: string;
  private _name?: string;

  protected initializeDefaultName(params: {
    provider: Provider;
    operation: string;
    actionType: ActionType;
  }) {
    const { provider, actionType, operation } = params;
    this._provider = provider;
    this._operation = operation;
    this._actionType = actionType;

    this._name =
      `${this.provider}_${this._actionType}_${this._operation}`.toUpperCase();
  }

  public get provider() {
    return this._provider || "NULL_PROVIDER";
  }

  public get name() {
    return this._name || "NULL_NAME";
  }

  public get actionType() {
    return this._actionType || "NULL_ACTION_TYPE";
  }

  protected getTxName(name: string) {
    return `${this.name}-${name}`;
  }

  protected async getDefaultApproveTransaction(params: {
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

  protected getDefaultContractAddress(params: {
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
}

export default Action;
