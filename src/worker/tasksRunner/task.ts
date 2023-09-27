import Big from "big.js";

import Account from "../../core/account";
import Operation from "../../core/operation";
import Queue from "../../core/queue";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "INSUFFICIENT_BALANCE"
  | "WAITING"
  | "DONE"
  | "FEE_LIMIT";

class Task extends Queue<Operation> {
  public readonly account: Account;
  private _transactionsPerformed: number;
  private _totalFee: number;
  public readonly minimumTransactionsLimit: number;
  private _status: TaskStatus;

  public constructor(params: {
    account: Account;
    minimumTransactionsLimit: number;
    status?: TaskStatus;
    operations?: Operation[];
  }) {
    const {
      account,
      minimumTransactionsLimit,
      status = "TODO",
      operations,
    } = params;

    super(operations);

    this.account = account;
    this._transactionsPerformed = 0;
    this._totalFee = 0;
    this.minimumTransactionsLimit = minimumTransactionsLimit;
    this._status = status;
  }

  public get transactionsPerformed() {
    return this._transactionsPerformed;
  }

  public get totalFee() {
    return this._totalFee;
  }

  public get txsDone() {
    return `${this.transactionsPerformed}/${this.minimumTransactionsLimit}`;
  }

  public get totalFeeStr() {
    return `$${this._totalFee}`;
  }

  public onTransactionSuccess(fee: number) {
    this._transactionsPerformed = this._transactionsPerformed + 1;
    this._totalFee = Big(this._totalFee).plus(fee).toNumber();
  }

  public changeStatus(status: TaskStatus) {
    this._status = status;
  }

  public get status() {
    return this._status;
  }

  public operationsString(isShort?: boolean) {
    if (!this.size()) return "no operations";

    const separator = " => ";

    if (!isShort || this.size() <= 2) {
      return this.storage.map((operation) => `[${operation}]`).join(separator);
    }

    const first = this.storage[0];
    const last = this.storage[this.size() - 1];

    const betweenCount = this.size() - 2;

    const operations = [first, `(${betweenCount})`, last];

    return operations.join(separator);
  }

  public toString() {
    return `${this.account} [${this.status}]: ${this.operationsString()}`;
  }

  public isEquals(task: Task) {
    return this.account.isEquals(task.account);
  }

  public isMinimumTransactionsLimitReached() {
    return this.transactionsPerformed >= this.minimumTransactionsLimit;
  }

  public isFeeGte(fee: number) {
    return Big(this.totalFee).gte(fee);
  }

  public getNextOperation() {
    if (this.isEmpty()) {
      throw new Error("task is empty");
    }

    const operation = this.shift();

    if (!operation) {
      throw new Error(`operation is not found`);
    }

    if (operation.isEmpty()) {
      throw new Error(`operation is empty`);
    }

    return operation;
  }

  public clear() {
    this.storage = [];
  }
}

export default Task;
