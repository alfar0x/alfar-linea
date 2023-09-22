import Account from "../../core/account";
import Queue from "../../core/queue";
import Step from "../../core/step";

class Task extends Queue<Step> {
  public account: Account;
  public minimumTransactionsLimit: number;

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

  public setNextSteps(steps: Step[]) {
    this.storage = steps;
  }

  public getNextStep() {
    return this.shift();
  }
}

export default Task;
