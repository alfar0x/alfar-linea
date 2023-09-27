import LendAction from "../action/lend/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import arraySortStringsHelper from "../utils/array/arraySortStringsHelper";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = LendAction;

class SupplyEthRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];
  public readonly description = "supply -> redeem eth";

  public constructor(params: {
    lendActions: LendAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }) {
    const {
      lendActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    } = params;

    super({
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    });

    this.possibleRoutes = SupplyEthRouter.initializePossibleRoutes(lendActions);
  }

  private static initializePossibleRoutes(lendActions: LendAction[]) {
    return lendActions.filter((supplyAction) => supplyAction.token.isNative);
  }

  public possibleRoutesStrings() {
    return this.possibleRoutes
      .map((possibleRoute) => `${possibleRoute}`)
      .sort(arraySortStringsHelper);
  }

  public size() {
    return this.possibleRoutes.length;
  }

  public generateOperationList(params: { account: Account }) {
    const { account } = params;

    const supplyRouter = randomChoice(this.possibleRoutes);

    const supplyStep = supplyRouter.supplyStep({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
      minApproveMultiplier: this.minApproveMultiplier,
      maxApproveMultiplier: this.maxApproveMultiplier,
    });

    const redeemStep = supplyRouter.redeemAllStep({ account });

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
