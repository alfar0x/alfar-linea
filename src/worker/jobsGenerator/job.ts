import Account from "../../core/account";
import Step from "../../core/step";

class Job {
  account: Account;
  private minimumTransactionsLimit: number;
  private steps: Step[];

  constructor(params: {
    account: Account;
    minimumTransactionsLimit: number;
    steps: Step[];
  }) {
    const { account, minimumTransactionsLimit, steps } = params;

    this.account = account;
    this.minimumTransactionsLimit = minimumTransactionsLimit;
    this.steps = steps;
  }

  isEmpty() {
    return !this.steps.length;
  }

  nextStep(): Step | undefined {
    return this.steps.shift();
  }

  toString() {
    return this.steps.map(String).join(", ");
  }

  isEquals(job: Job) {
    return this.account.isEquals(job.account);
  }

  isMinimumTransactionsLimitReached() {
    return (
      this.account.transactionsPerformed() >= this.minimumTransactionsLimit
    );
  }

  setNextSteps(steps: Step[]) {
    this.steps = steps;
  }
}

export default Job;
