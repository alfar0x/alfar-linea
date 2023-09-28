import Big from "big.js";

import LendAction from "../action/lend/base";
import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import Token from "../core/token";
import arraySortStringsHelper from "../utils/array/arraySortStringsHelper";
import randomChoice from "../utils/random/randomChoice";
import randomElementWithWeight from "../utils/random/randomElementWithWeight";
import randomShuffle from "../utils/random/randomShuffle";

type PossibleRoute = {
  token: Token;
  buyActions: SwapAction[];
  lendActions: LendAction[];
  sellActions: SwapAction[];
};

class SwapSupplyTokenRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];
  public readonly description = "swap eth -> token -> supply -> redeem -> eth";

  public constructor(params: {
    swapActions: SwapAction[];
    lendActions: LendAction[];
  }) {
    const { swapActions, lendActions } = params;

    super();

    this.possibleRoutes = SwapSupplyTokenRouter.initializePossibleRoutes(
      swapActions,
      lendActions,
    );
  }

  private static getUniqueTokens(lendActions: LendAction[]) {
    const uniquesTokens: Token[] = [];

    for (const lendAction of lendActions) {
      const isAdded = uniquesTokens.some((token) =>
        token.isEquals(lendAction.token),
      );

      if (!isAdded) uniquesTokens.push(lendAction.token);
    }

    return uniquesTokens;
  }

  private static initializePossibleRoutes(
    swapActions: SwapAction[],
    lendActions: LendAction[],
  ) {
    const uniquesTokens = SwapSupplyTokenRouter.getUniqueTokens(lendActions);

    const possibleRoutes = uniquesTokens.reduce<PossibleRoute[]>(
      (acc, token) => {
        const supplyTokenActions = lendActions.filter((lendAction) =>
          lendAction.token.isEquals(token),
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
          lendActions: supplyTokenActions,
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
          possibleRoute.lendActions.map((lendAction) =>
            possibleRoute.sellActions.map(
              (sellAction) => `${buyAction} -> ${lendAction} -> ${sellAction}`,
            ),
          ),
        ),
      )
      .flat(depth)
      .sort(arraySortStringsHelper);
  }

  public size() {
    return this.possibleRoutes
      .reduce(
        (acc, item) =>
          Big(item.buyActions.length)
            .times(item.lendActions.length)
            .times(item.sellActions.length)
            .plus(acc),
        Big(0),
      )
      .toNumber();
  }

  public generateOperationList(params: { account: Account }) {
    const { account } = params;

    const tokensWithWeights = this.possibleRoutes.map((possibleRoute) => {
      const weight = Big(possibleRoute.buyActions.length)
        .times(possibleRoute.lendActions.length)
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

    const buyPossibleSteps = possibleRoute.buyActions.map((action) =>
      action.swapStep({ account }),
    );

    const buyOperation = new Operation({
      name: `SWAP_ETH_${token.name}`,
      steps: randomShuffle(buyPossibleSteps),
    });

    const supplyTokenAction = randomChoice(possibleRoute.lendActions);

    const supplyStep = supplyTokenAction.supplyStep({
      account,
      isAllBalance: true,
    });

    const supplyOperation = new Operation({
      name: supplyStep.name,
      steps: [supplyStep],
    });

    const redeemAllStep = supplyTokenAction.redeemAllStep({ account });

    const redeemAllOperation = new Operation({
      name: redeemAllStep.name,
      steps: [redeemAllStep],
    });

    const sellPossibleSteps = possibleRoute.sellActions.map((action) =>
      action.swapStep({
        account,
        isAllBalance: true,
      }),
    );

    const sellOperation = new Operation({
      name: `SWAP_${token.name}_ETH`,
      steps: randomShuffle(sellPossibleSteps),
    });

    return [buyOperation, supplyOperation, redeemAllOperation, sellOperation];
  }
}

export default SwapSupplyTokenRouter;
