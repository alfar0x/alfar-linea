import Account from "./account";
import Step from "./step";

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
  public abstract generateSteps(params: { account: Account }): Promise<Step[]>;
}

export default Router;
