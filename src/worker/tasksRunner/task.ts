import Account from "../../core/account";
import Queue from "../../core/queue";
import Step from "../../core/step";

class Task extends Queue<Step> {
  public readonly account: Account;
  public readonly minimumTransactionsLimit: number;

  public constructor(params: {
    account: Account;
    minimumTransactionsLimit: number;
    steps?: Step[];
  }) {
    const { account, minimumTransactionsLimit, steps } = params;

    super(steps);

    this.account = account;
    this.minimumTransactionsLimit = minimumTransactionsLimit;
  }

  public infoStr() {
    const { account } = this;
    const limit = this.minimumTransactionsLimit;
    const steps = this.storage.length
      ? this.stepsString()
      : "no steps have been created yet";

    return `${account} / txs limit:${limit}: ${steps}`;
  }

  public stepsString() {
    return this.storage.map((step) => `[${step}]`).join(" => ");
  }

  public toString() {
    return `${this.account}: ${this.stepsString()}`;
  }

  public isEquals(task: Task) {
    return this.account.isEquals(task.account);
  }

  public isMinimumTransactionsLimitReached() {
    return (
      this.account.transactionsPerformed() >= this.minimumTransactionsLimit
    );
  }

  public getNextStep() {
    return this.shift();
  }

  public clear() {
    this.storage = [];
  }
}

export default Task;
