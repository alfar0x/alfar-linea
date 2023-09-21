import Account from "../../core/account";
import Step from "../../core/step";

class Task {
  public account: Account;
  private minimumTransactionsLimit: number;
  private steps: Step[];

  public constructor(params: {
    account: Account;
    minimumTransactionsLimit: number;
    steps: Step[];
  }) {
    const { account, minimumTransactionsLimit, steps } = params;

    this.account = account;
    this.minimumTransactionsLimit = minimumTransactionsLimit;
    this.steps = steps;
  }

  public isEmpty() {
    return !this.steps.length;
  }

  public nextStep(): Step | undefined {
    return this.steps.shift();
  }

  public toString() {
    return this.steps.map(String).join(", ");
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
    this.steps = steps;
  }
}

export default Task;
