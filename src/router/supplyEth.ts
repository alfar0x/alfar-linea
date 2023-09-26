import SupplyAction from "../action/supply/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import sortStringsHelper from "../utils/other/sortStringsHelper";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = SupplyAction;

class SupplyEthRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];
  public readonly description = "supply -> redeem eth";

  public constructor(params: {
    supplyActions: SupplyAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { supplyActions, minWorkAmountPercent, maxWorkAmountPercent } =
      params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleRoutes =
      SupplyEthRouter.initializePossibleRoutes(supplyActions);
  }

  private static initializePossibleRoutes(supplyActions: SupplyAction[]) {
    return supplyActions.filter((supplyAction) => supplyAction.token.isNative);
  }

  public possibleRoutesStrings() {
    return this.possibleRoutes
      .map((possibleRoute) => `${possibleRoute}`)
      .sort(sortStringsHelper);
  }

  public size() {
    return this.possibleRoutes.length;
  }

  public async generateOperationList(params: {
    account: Account;
  }): Promise<Operation[]> {
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

    const supplyOperation = new Operation({
      name: supplyStep.name,
      steps: [supplyStep],
    });

    const redeemOperation = new Operation({
      name: redeemStep.name,
      steps: [redeemStep],
    });

    return [supplyOperation, redeemOperation];
  }
}

export default SupplyEthRouter;
