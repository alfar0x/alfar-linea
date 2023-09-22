import RandomAction from "../action/random/base";
import Account from "../core/account";
import Router from "../core/router";
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
      .sort();
  }

  public size() {
    return this.possibleRoutes.length;
  }

  public async generateSteps(params: { account: Account }) {
    const { account } = params;

    const randomAction = randomChoice(this.possibleRoutes);

    const steps = await randomAction.steps({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    return steps;
  }

  public async getRandomSteps(params: { account: Account }) {
    const { account } = params;
    const action = randomChoice(this.randomActions);
    return await action.steps({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });
  }
}

export default RandomRouter;
