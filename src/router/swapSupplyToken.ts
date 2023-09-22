import SupplyAction from "../action/supply/base";
import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Router from "../core/router";
import sortStringsHelper from "../utils/other/sortStringsHelper";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = {
  buyAction: SwapAction;
  supplyAction: SupplyAction;
  sellAction: SwapAction;
};

class SwapSupplyTokenRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];
  public readonly description = "swap eth -> token -> supply -> redeem -> eth";

  public constructor(params: {
    swapActions: SwapAction[];
    supplyActions: SupplyAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const {
      swapActions,
      supplyActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleRoutes = this.initializePossibleRoutes(
      swapActions,
      supplyActions,
    );
  }

  private initializePossibleRoutes(
    swapActions: SwapAction[],
    supplyActions: SupplyAction[],
  ) {
    const possibleRoutes = supplyActions.reduce((acc, supplyAction) => {
      if (supplyAction.token.isNative) return acc;

      const routesToBuyAndSellToken = swapActions.reduce((acc, buyAction) => {
        if (!buyAction.fromToken.isNative) return acc;

        if (!buyAction.toToken.isEquals(supplyAction.token)) return acc;

        const sellPossibleRoutes = swapActions.filter((sellAction) =>
          buyAction.toToken.isEquals(sellAction.fromToken),
        );

        const directions = sellPossibleRoutes.map((sellAction) => ({
          buyAction,
          supplyAction,
          sellAction,
        }));

        return [...acc, ...directions];
      }, [] as PossibleRoute[]);

      return [...acc, ...routesToBuyAndSellToken];
    }, [] as PossibleRoute[]);

    return possibleRoutes;
  }

  public possibleRoutesStrings() {
    return this.possibleRoutes
      .map(
        (possibleRoute) =>
          `${possibleRoute.buyAction} -> ${possibleRoute.supplyAction} -> ${possibleRoute.sellAction}`,
      )
      .sort(sortStringsHelper);
  }

  public size() {
    return this.possibleRoutes.length;
  }

  public async generateSteps(params: { account: Account }) {
    const { account } = params;

    const { buyAction, supplyAction, sellAction } = randomChoice(
      this.possibleRoutes,
    );

    const buyStep = await buyAction.swapPercentStep({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    const supplyStep = await supplyAction.supplyBalanceStep({
      account,
    });

    const redeemAllStep = supplyAction.redeemAllStep({
      account,
    });

    const sellStep = await sellAction.swapBalanceStep({
      account,
    });

    return [buyStep, supplyStep, redeemAllStep, sellStep];
  }
}

export default SwapSupplyTokenRouter;
