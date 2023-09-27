import Big from "big.js";

import LendAction from "../action/lend/base";
import RandomAction from "../action/random/base";
import SwapAction from "../action/swap/base";
import Account from "../core/account";
import Operation from "../core/operation";
import Router from "../core/router";
import RandomRouter from "../router/random";
import SupplyEthRouter from "../router/supplyEth";
import SwapEthTokenEthRouter from "../router/swapEthTokenEth";
import SwapSupplyTokenRouter from "../router/swapSupplyToken";
import randomElementWithWeight from "../utils/random/randomElementWithWeight";
import randomInteger from "../utils/random/randomInteger";

type RouterId =
  | "RANDOM"
  | "SUPPLY_ETH"
  | "SWAP_ETH_TOKEN_ETH"
  | "SWAP_SUPPLY_TOKEN";

type RouterData = {
  key: RouterId;
  value: Router;
  weight: number;
};

class OperationFactory {
  private readonly routers: RouterData[];
  private readonly totalWeight: number;

  public constructor(params: {
    swapActions: SwapAction[];
    lendActions: LendAction[];
    randomActions: RandomAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }) {
    const {
      swapActions,
      lendActions,
      randomActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    } = params;

    this.routers = OperationFactory.initializeRouters({
      swapActions,
      lendActions,
      randomActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    });

    this.totalWeight = Object.values(this.routers)
      .reduce((sum, { weight }) => sum.plus(weight), Big(0))
      .toNumber();
  }

  private static initializeRouters(params: {
    swapActions: SwapAction[];
    lendActions: LendAction[];
    randomActions: RandomAction[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }) {
    const {
      swapActions,
      lendActions,
      randomActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    } = params;

    const swapEthTokenEthRouter = new SwapEthTokenEthRouter({
      swapActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    });

    const supplyEthRouter = new SupplyEthRouter({
      lendActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    });

    const swapSupplyTokenRouter = new SwapSupplyTokenRouter({
      lendActions,
      swapActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    });

    const randomRouter = new RandomRouter({
      randomActions,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    });

    const data: RouterData[] = [
      {
        key: "SWAP_ETH_TOKEN_ETH",
        value: swapEthTokenEthRouter,
        weight: swapEthTokenEthRouter.size() ? 70 : 0,
      },
      {
        key: "SUPPLY_ETH",
        value: supplyEthRouter,
        weight: supplyEthRouter.size() ? 10 : 0,
      },
      {
        key: "SWAP_SUPPLY_TOKEN",
        value: swapSupplyTokenRouter,
        weight: swapSupplyTokenRouter.size() ? 10 : 0,
      },
      {
        key: "RANDOM",
        value: randomRouter,
        weight: randomRouter.size() ? 10 : 0,
      },
    ];

    return data;
  }

  private async generateRandomOperations(params: { account: Account }) {
    const { account } = params;

    const router = randomElementWithWeight(this.routers);

    const operations = await router.generateOperationList({
      account,
    });

    return operations;
  }

  private shouldRandomTypeOperationsBeAdded() {
    const randomTypeRouterData = this.routers.find((r) => r.key === "RANDOM");

    if (!randomTypeRouterData) return false;

    const { value, weight } = randomTypeRouterData;

    if (!value.size()) return false;

    return Big(weight).div(this.totalWeight).gte(Math.random());
  }

  private async addRandomTypeOperations(
    account: Account,
    operations: Operation[],
  ) {
    const randomTypeRouterData = this.routers.find((r) => r.key === "RANDOM");

    if (!randomTypeRouterData) return operations;

    const { value } = randomTypeRouterData;

    const randomOperations = await value.generateOperationList({
      account,
    });

    const randomIndex = randomInteger(0, operations.length - 1).toNumber();

    const firstPart = operations.slice(0, randomIndex);
    const secondPart = operations.slice(randomIndex);

    return [...firstPart, ...randomOperations, ...secondPart];
  }

  public async getRandomOperations(params: { account: Account }) {
    const { account } = params;

    const steps = await this.generateRandomOperations({ account });

    if (!this.shouldRandomTypeOperationsBeAdded()) return steps;

    return await this.addRandomTypeOperations(account, steps);
  }

  public info(isFull = false) {
    const routesInfo = this.routers.map(({ value }) => {
      const short = `${value.description}: ${value.size()}`;

      if (!isFull) return short;

      const possibleRoutesStrings = value.possibleRoutesStrings().join("\n");

      return `${short}\n${possibleRoutesStrings}`;
    });

    return routesInfo;
  }
}

export default OperationFactory;