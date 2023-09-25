import Big from "big.js";

import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import Token from "../core/token";
import sortStringsHelper from "../utils/other/sortStringsHelper";
import randomElementWithWeight from "../utils/random/randomElementWithWeight";
import randomShuffle from "../utils/random/randomShuffle";

type PossibleRoute = {
  token: Token;
  buyActions: SwapAction[];
  sellActions: SwapAction[];
};

class SwapEthTokenEthRouter extends Router {
  private readonly possibleRoutes: PossibleRoute[];

  public readonly description = "swap eth -> token -> eth";

  public constructor(params: {
    swapActions: SwapAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { swapActions, minWorkAmountPercent, maxWorkAmountPercent } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleRoutes =
      SwapEthTokenEthRouter.initializePossibleRoutes(swapActions);
  }

  private static getUniqueTokens(swapActions: SwapAction[]) {
    const uniquesTokens: Token[] = [];

    for (const swapAction of swapActions) {
      if (!swapAction.toToken.isNative) continue;

      const isAdded = uniquesTokens.some((token) =>
        token.isEquals(swapAction.fromToken),
      );

      if (!isAdded) uniquesTokens.push(swapAction.fromToken);
    }

    return uniquesTokens;
  }

  private static initializePossibleRoutes(swapActions: SwapAction[]) {
    const uniquesTokens = SwapEthTokenEthRouter.getUniqueTokens(swapActions);

    const possibleRoutes = uniquesTokens.reduce<PossibleRoute[]>(
      (acc, token) => {
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
          sellActions,
        };

        return [...acc, tokenPossibleRoute];
      },
      [],
    );

    return possibleRoutes;
  }

  public possibleRoutesStrings() {
    const depth = 2;

    return this.possibleRoutes
      .map((possibleRoute) =>
        possibleRoute.buyActions.map((butAction) =>
          possibleRoute.sellActions.map(
            (sellAction) => `${butAction} -> ${sellAction}`,
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
          Big(item.buyActions.length).times(item.sellActions.length).plus(acc),
        Big(0),
      )
      .toNumber();
  }

  public async generateOperationList(params: { account: Account }) {
    const { account } = params;

    const tokensWithWeights = this.possibleRoutes.map((possibleRoute) => {
      const weight = Big(possibleRoute.buyActions.length)
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

    const sellPossibleSteps = possibleRoute.sellActions.map((action) =>
      action.swapAmountStep({ account, normalizedAmount }),
    );

    const sellOperation = new Operation({
      name: `SWAP_${token.name}_ETH`,
      steps: randomShuffle(sellPossibleSteps),
    });

    return [buyOperation, sellOperation];
  }
}

export default SwapEthTokenEthRouter;
