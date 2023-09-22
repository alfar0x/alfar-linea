import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Router from "../core/router";
import randomChoice from "../utils/random/randomChoice";

type PossibleRoute = {
  buyAction: SwapAction;
  sellAction: SwapAction;
};

class SwapEthTokenEthRouter extends Router {
  private possibleRoutes: PossibleRoute[];

  public readonly description = "swap eth -> token -> eth";

  public constructor(params: {
    swapActions: SwapAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { swapActions, minWorkAmountPercent, maxWorkAmountPercent } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleRoutes = this.initializePossibleRoutes(swapActions);
  }

  private initializePossibleRoutes(swapActions: SwapAction[]) {
    const possibleRoutes = swapActions.reduce((acc, buyAction) => {
      if (!buyAction.fromToken.isNative) return acc;

      const sellPossibleRoutes = swapActions.filter((sellAction) =>
        buyAction.toToken.isEquals(sellAction.fromToken),
      );

      const directions = sellPossibleRoutes.map((sellAction) => ({
        buyAction,
        sellAction,
      }));

      return [...acc, ...directions];
    }, [] as PossibleRoute[]);
    return possibleRoutes;
  }

  public possibleRoutesStrings() {
    return this.possibleRoutes
      .map(
        (possibleRoute) =>
          `${possibleRoute.buyAction} -> ${possibleRoute.sellAction}`,
      )
      .sort();
  }

  public size() {
    return this.possibleRoutes.length;
  }

  public async generateSteps(params: { account: Account }) {
    const { account } = params;

    const { buyAction, sellAction } = randomChoice(this.possibleRoutes);

    const buyStep = await buyAction.swapPercentStep({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    const sellStep = await sellAction.swapBalanceStep({
      account,
    });

    return [buyStep, sellStep];
  }
}

export default SwapEthTokenEthRouter;
