import Account from "./account";
import Operation from "./operation";

abstract class Router {
  protected minWorkAmountPercent: number;
  protected maxWorkAmountPercent: number;

  public constructor(params: {
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { minWorkAmountPercent, maxWorkAmountPercent } = params;
    this.minWorkAmountPercent = minWorkAmountPercent;
    this.maxWorkAmountPercent = maxWorkAmountPercent;
  }
  public abstract description: string;
  public abstract size(): number;
  public abstract possibleRoutesStrings(): string[];
  // eslint-disable-next-line no-unused-vars
  public abstract generateOperationList(params: {
    account: Account;
  }): Promise<Operation[]>;

  protected static stepsToOperations(steps: Step[]) {
    const operations = steps.map(
      (step) => new Operation({ name: step.name, steps: [step] }),
    );

    return operations;
  }
}

export default Router;
