import Account from "../../core/account";
import Operation from "../../core/operation";
import Queue from "../../core/queue";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "INSUFFICIENT_BALANCE"
  | "WAITING"
  | "DONE";

class Task extends Queue<Operation> {
  public readonly account: Account;
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
    this.minimumTransactionsLimit = minimumTransactionsLimit;
    this._status = status;
  }

  public changeStatus(status: TaskStatus) {
    this._status = status;
  }

  public get status() {
    return this._status;
  }

  public operationsString() {
    return this.storage.map((operation) => `[${operation}]`).join(" => ");
  }

  public toString() {
    return `${this.account} [${this.status}]: ${this.operationsString()}`;
  }

  public isEquals(task: Task) {
    return this.account.isEquals(task.account);
  }

  public isMinimumTransactionsLimitReached() {
    return this.account.transactionsPerformed >= this.minimumTransactionsLimit;
  }

  public getNextOperation() {
    return this.shift();
  }

  public clear() {
    this.storage = [];
  }
}

export default Task;
