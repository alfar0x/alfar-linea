import Account from "../../core/account";
import Operation from "../../core/operation";
import Queue from "../../core/queue";
import createMessage from "../../utils/other/createMessage";

class Task extends Queue<Operation> {
  public readonly account: Account;
  public readonly minimumTransactionsLimit: number;

  public constructor(params: {
    account: Account;
    minimumTransactionsLimit: number;
    operations?: Operation[];
  }) {
    const { account, minimumTransactionsLimit, operations } = params;

    super(operations);

    this.account = account;
    this.minimumTransactionsLimit = minimumTransactionsLimit;
  }

  public infoStr() {
    const { account } = this;
    const limit = this.minimumTransactionsLimit;
    const operations = this.storage.length
      ? this.operationsString()
      : "no operations have been created yet";

    return createMessage(account, `min txs limit:${limit}`, operations);
  }

  public operationsString() {
    return this.storage.map((operation) => `[${operation}]`).join(" => ");
  }

  public toString() {
    return `${this.account}: ${this.operationsString()}`;
  }

  public isEquals(task: Task) {
    return this.account.isEquals(task.account);
  }

  public isMinimumTransactionsLimitReached() {
    return (
      this.account.transactionsPerformed() >= this.minimumTransactionsLimit
    );
  }

  public getNextOperation() {
    return this.shift();
  }

  public clear() {
    this.storage = [];
  }
}

export default Task;
