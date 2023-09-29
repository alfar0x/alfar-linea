import RandomAction from "../action/random/base";
import Account from "../core/account";
import Router from "../core/router";
import arraySortStringsHelper from "../utils/array/arraySortStringsHelper";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = RandomAction;

class RandomRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];
  private readonly randomActions: RandomAction[];

  public readonly description = "random";

  public constructor(params: { randomActions: RandomAction[] }) {
    const { randomActions } = params;

    super();

    this.randomActions = randomActions;
    this.possibleRoutes = randomActions;
  }

  public possibleRoutesStrings() {
    return this.possibleRoutes
      .map((possibleRoute) => `${possibleRoute}`)
      .sort(arraySortStringsHelper);
  }

  public size() {
    return this.possibleRoutes.length;
  }

  public async generateOperationList(params: { account: Account }) {
    const { account } = params;

    const randomAction = randomChoice(this.possibleRoutes);

    const steps = await randomAction.steps({ account });

    return Router.stepsToOperations(steps);
  }

  public async getRandomOperationList(params: { account: Account }) {
    const { account } = params;
    const action = randomChoice(this.randomActions);
    const steps = await action.steps({ account });

    return Router.stepsToOperations(steps);
  }
}

export default RandomRouter;
