import SupplyAction from "../action/supply/base";
import Account from "../core/account";
import Router from "../core/router";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = SupplyAction;

class SupplyEthRouter extends Router {
  private possibleRoutes: PossibleRoute[];
  public description = "supply -> redeem eth";

  public constructor(params: {
    supplyActions: SupplyAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { supplyActions, minWorkAmountPercent, maxWorkAmountPercent } =
      params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleRoutes = this.initializePossibleRoutes(supplyActions);
  }

  private initializePossibleRoutes(supplyActions: SupplyAction[]) {
    return supplyActions.filter((supplyAction) => supplyAction.token.isNative);
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

    const supplyRouter = randomChoice(this.possibleRoutes);

    const supplyStep = await supplyRouter.supplyPercentStep({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    const redeemStep = supplyRouter.redeemAllStep({
      account,
    });

    return [supplyStep, redeemStep];
  }
}

export default SupplyEthRouter;
