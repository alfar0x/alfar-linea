/* eslint-disable no-unused-vars */
import Account from "./account";
import RunnableTransaction from "./transaction";

abstract class Block {
  protected minWorkAmountPercent: number;
  protected maxWorkAmountPercent: number;

  constructor(params: {
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { minWorkAmountPercent, maxWorkAmountPercent } = params;
    this.minWorkAmountPercent = minWorkAmountPercent;
    this.maxWorkAmountPercent = maxWorkAmountPercent;
  }
  abstract description: string;
  abstract count(): number;
  abstract possibleWaysStrings(): string[];
  abstract generateTransactions(params: {
    account: Account;
  }): Promise<RunnableTransaction[]>;
}

export default Block;
