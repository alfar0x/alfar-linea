import Big from "big.js";

import SupplyAction from "../action/supply/base";
import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import Token from "../core/token";
import sortStringsHelper from "../utils/other/sortStringsHelper";
import randomChoice from "../utils/random/randomChoice";
import randomElementWithWeight from "../utils/random/randomElementWithWeight";
import randomShuffle from "../utils/random/randomShuffle";

type PossibleRoute = {
  token: Token;
  buyActions: SwapAction[];
  supplyActions: SupplyAction[];
  sellActions: SwapAction[];
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

  private getUniqueTokens(supplyActions: SupplyAction[]) {
    const uniquesTokens: Token[] = [];

    for (const supplyAction of supplyActions) {
      const isAdded = uniquesTokens.some((token) =>
        token.isEquals(supplyAction.token),
      );

      if (!isAdded) uniquesTokens.push(supplyAction.token);
    }

    return uniquesTokens;
  }

  private initializePossibleRoutes(
    swapActions: SwapAction[],
    supplyActions: SupplyAction[],
  ) {
    const uniquesTokens = this.getUniqueTokens(supplyActions);

    const possibleRoutes = uniquesTokens.reduce<PossibleRoute[]>(
      (acc, token) => {
        const supplyTokenActions = supplyActions.filter((supplyAction) =>
          supplyAction.token.isEquals(token),
        );

        if (!supplyTokenActions.length) return acc;

        const buyActions = swapActions.filter(
          (swapAction) =>
            swapAction.fromToken.isNative && swapAction.toToken.isEquals(token),
        );

        if (!buyActions.length) return acc;

        const sellActions = swapActions.filter(
          (swapAction) =>
            swapAction.toToken.isNative && swapAction.fromToken.isEquals(token),
        );

        if (!sellActions.length) return acc;

        const tokenPossibleRoute = {
          token,
          buyActions,
          supplyActions: supplyTokenActions,
          sellActions,
        };

        return [...acc, tokenPossibleRoute];
      },
      [],
    );

    return possibleRoutes;
  }

  public possibleRoutesStrings() {
    const depth = 3;
    return this.possibleRoutes
      .flatMap((possibleRoute) =>
        possibleRoute.buyActions.map((buyAction) =>
          possibleRoute.supplyActions.map((supplyAction) =>
            possibleRoute.sellActions.map(
              (sellAction) =>
                `${buyAction} -> ${supplyAction} -> ${sellAction}`,
            ),
          ),
        ),
      )
      .flat(depth)
      .sort(sortStringsHelper);
  }

  public size() {
    return this.possibleRoutes
      .reduce(
        (acc, item) =>
          Big(item.buyActions.length)
            .times(item.supplyActions.length)
            .times(item.sellActions.length)
            .plus(acc),
        Big(0),
      )
      .toNumber();
  }

  public async generateOperationList(params: { account: Account }) {
    const { account } = params;

    const tokensWithWeights = this.possibleRoutes.map((possibleRoute) => {
      const weight = Big(possibleRoute.buyActions.length)
        .times(possibleRoute.supplyActions.length)
        .times(possibleRoute.sellActions.length)
        .toNumber();

      return { value: possibleRoute.token, weight };
    });

    const token = randomElementWithWeight(tokensWithWeights);

    const possibleRoute = this.possibleRoutes.find((item) =>
      item.token.isEquals(token),
    );

    if (!possibleRoute) {
      throw new Error(
        `unexpected error. possible route with token ${token} is not found`,
      );
    }

    const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
      token,
      this.minWorkAmountPercent,
      this.maxWorkAmountPercent,
    );

    const buyPossibleSteps = possibleRoute.buyActions.map((action) =>
      action.swapAmountStep({ account, normalizedAmount }),
    );

    const buyOperation = new Operation({
      name: `SWAP_ETH_${token.name}`,
      steps: randomShuffle(buyPossibleSteps),
    });

    const supplyTokenAction = randomChoice(possibleRoute.supplyActions);

    const supplyStep = await supplyTokenAction.supplyBalanceStep({
      account,
    });

    const supplyOperation = new Operation({
      name: supplyStep.name,
      steps: [supplyStep],
    });

    const redeemAllStep = supplyTokenAction.redeemAllStep({
      account,
    });

    const redeemAllOperation = new Operation({
      name: redeemAllStep.name,
      steps: [redeemAllStep],
    });

    const sellPossibleSteps = possibleRoute.sellActions.map((action) =>
      action.swapAmountStep({ account, normalizedAmount }),
    );

    const sellOperation = new Operation({
      name: `SWAP_${token.name}_ETH`,
      steps: randomShuffle(sellPossibleSteps),
    });

    return [buyOperation, supplyOperation, redeemAllOperation, sellOperation];
  }
}

export default SwapSupplyTokenRouter;
