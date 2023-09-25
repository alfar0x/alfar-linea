import RandomAction from "../action/random/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import Step from "../core/step";
import sortStringsHelper from "../utils/other/sortStringsHelper";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = RandomAction;

class RandomRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];
  private readonly randomActions: RandomAction[];

  public readonly description = "random";

  public constructor(params: {
    randomActions: RandomAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { randomActions, minWorkAmountPercent, maxWorkAmountPercent } =
      params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.randomActions = randomActions;
    this.possibleRoutes = this.initializePossibleRoutes(randomActions);
  }

  public initializePossibleRoutes(randomActions: RandomAction[]) {
    return randomActions;
  }

  public possibleRoutesStrings() {
    return this.possibleRoutes
      .map((possibleRoute) => `${possibleRoute}`)
      .sort(sortStringsHelper);
  }

  public size() {
    return this.possibleRoutes.length;
  }

  private stepsToOperations(steps: Step[]) {
    const operations = steps.map(
      (step) => new Operation({ name: step.name, steps: [step] }),
    );

    return operations;
  }

  public async generateOperationList(params: { account: Account }) {
    const { account } = params;

    const randomAction = randomChoice(this.possibleRoutes);

    const steps = await randomAction.steps({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    return this.stepsToOperations(steps);
  }

  public async getRandomOperationList(params: { account: Account }) {
    const { account } = params;
    const action = randomChoice(this.randomActions);
    const steps = await action.steps({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    return this.stepsToOperations(steps);
  }
}

export default RandomRouter;
