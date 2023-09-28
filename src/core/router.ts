import Account from "./account";
import Operation from "./operation";
import Step from "./step";

abstract class Router {
  public abstract description: string;
  public abstract size(): number;
  public abstract possibleRoutesStrings(): string[];
  // eslint-disable-next-line no-unused-vars
  public abstract generateOperationList(params: {
    account: Account;
  }): Promise<Operation[]> | Operation[];

  protected static stepsToOperations(steps: Step[]) {
    const operations = steps.map(
      (step) => new Operation({ name: step.name, steps: [step] }),
    );

    return operations;
  }
}

export default Router;
