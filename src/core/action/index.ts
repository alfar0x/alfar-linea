import { Amount } from "../../types";
import Account from "../account";
import Token from "../token";
import RunnableTransaction, { CreateTransactionFunc } from "../transaction";
import { ActionType, Provider } from "./types";

class Action {
  public actionType: ActionType;
  public provider: Provider;
  public name: string;

  constructor(params: { provider: Provider; actionType: ActionType }) {
    const { provider, actionType } = params;
    this.provider = provider;
    this.actionType = actionType;
    this.name = `${provider}_${actionType}`;
  }

  protected getTxName(name: string) {
    return `${this.name}-${name}`;
  }

  protected async getApproveCreateTransaction(params: {
    account: Account;
    contractAddress: string;
    token: Token;
    normalizedAmount: Amount;
  }) {
    const { account, contractAddress, token, normalizedAmount } = params;

    const readableAmount = await token.toReadableAmount(normalizedAmount);

    const createTransaction: CreateTransactionFunc = async () => {
      const tx = await token.getApproveTransaction({
        account,
        spenderAddress: contractAddress,
        normalizedAmount,
      });
      const resultMsg = `${readableAmount} ${token}`;

      return { tx, resultMsg };
    };

    return createTransaction;
  }
}

export default Action;
