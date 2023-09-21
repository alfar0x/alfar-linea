import Big from "big.js";

import RandomAction from "../action/random/base";
import SupplyAction from "../action/supply/base";
import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Router from "../core/router";
import Step from "../core/step";
import RandomRouter from "../router/random";
import SupplyEthRouter from "../router/supplyEth";
import SwapEthTokenEthRouter from "../router/swapEthTokenEth";
import SwapSupplyTokenRouter from "../router/swapSupplyToken";

type RouterId =
  | "SWAP_ETH_TOKEN_ETH"
  | "SUPPLY_ETH"
  | "SWAP_SUPPLY_TOKEN"
  | "RANDOM";

class TaskFactory {
  private swapEthTokenEthRouter: SwapEthTokenEthRouter;
  private supplyEthRouter: SupplyEthRouter;
  private swapSupplyTokenRouter: SwapSupplyTokenRouter;
  private randomRouter: RandomRouter;

  private routersData: Record<RouterId, { router: Router; weight: number }>;

  public constructor(params: {
    swapActions: SwapAction[];
    supplyActions: SupplyAction[];
    randomActions: RandomAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const {
      swapActions,
      supplyActions,
      randomActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    } = params;

    this.swapEthTokenEthRouter = new SwapEthTokenEthRouter({
      swapActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.supplyEthRouter = new SupplyEthRouter({
      supplyActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.swapSupplyTokenRouter = new SwapSupplyTokenRouter({
      supplyActions,
      swapActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.randomRouter = new RandomRouter({
      randomActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.routersData = this.initializedWeights();
  }

  private initializedWeights() {
    return {
      // @TODO temporary hardcoded
      SWAP_ETH_TOKEN_ETH: {
        router: this.swapEthTokenEthRouter,
        weight: this.swapEthTokenEthRouter.count() ? 70 : 0,
      },
      SUPPLY_ETH: {
        router: this.supplyEthRouter,
        weight: this.supplyEthRouter.count() ? 10 : 0,
      },
      SWAP_SUPPLY_TOKEN: {
        router: this.swapSupplyTokenRouter,
        weight: this.swapSupplyTokenRouter.count() ? 10 : 0,
      },
      RANDOM: {
        router: this.randomRouter,
        weight: this.randomRouter.count() ? 10 : 0,
      },
    };
  }

  private getTotalRoutersWeight() {
    return Object.values(this.routersData).reduce(
      (sum, { weight }) => sum + weight,
      0,
    );
  }

  private getRandomWeightedRouter() {
    const totalWeight = this.getTotalRoutersWeight();

    let randomValue = Math.random() * totalWeight;

    for (const { router, weight } of Object.values(this.routersData)) {
      randomValue -= weight;

      if (randomValue <= 0) return router;
    }

    return null;
  }

  private async generateRandomSteps(params: { account: Account }) {
    const { account } = params;

    const router = this.getRandomWeightedRouter();

    if (!router) {
      throw new Error(`random router is not available: ${router}`);
    }

    const steps = await router.generateSteps({
      account,
    });

    return steps;
  }

  private shouldRandomTypeStepsBeAdded() {
    const totalWeight = this.getTotalRoutersWeight();

    return Big(this.routersData.RANDOM.weight)
      .div(totalWeight)
      .gte(Math.random());
  }

  private async addRandomTypeSteps(account: Account, steps: Step[]) {
    const randomSteps = await this.randomRouter.getRandomSteps({ account });

    const randomIdx = Math.floor(Math.random() * (steps.length + 1));

    const firstPart = steps.slice(0, randomIdx);
    const secondPart = steps.slice(randomIdx);

    return [...firstPart, ...randomSteps, ...secondPart];
  }

  public async getRandomActions(params: { account: Account }) {
    const { account } = params;

    const actions = await this.generateRandomSteps({
      account,
    });

    if (!this.shouldRandomTypeStepsBeAdded()) return actions;

    return await this.addRandomTypeSteps(account, actions);
  }

  public infoString(isFull = false) {
    const generatorsInfo = Object.values(this.routersData).map(({ router }) => {
      const short = `${router.description}: ${router.size()}`;

      if (!isFull) return short;

      const possibleRoutesStrings = router.possibleRoutesStrings().join("\n");

      return `${short}\n${possibleRoutesStrings}\n`;
    });

    const msg = [`Possible routes:`, ...generatorsInfo];

    return msg.join("\n");
  }
}

export default TaskFactory;
