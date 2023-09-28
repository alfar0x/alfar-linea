import Big from "big.js";

import LendAction from "../../../action/lend/base";
import RandomAction from "../../../action/random/base";
import SwapAction from "../../../action/swap/base";
import Account from "../../../core/account";
import Operation from "../../../core/operation";
import Router from "../../../core/router";
import RandomRouter from "../../../router/random";
import SupplyEthRouter from "../../../router/supplyEth";
import SwapEthTokenEthRouter from "../../../router/swapEthTokenEth";
import SwapSupplyTokenRouter from "../../../router/swapSupplyToken";
import randomElementWithWeight from "../../../utils/random/randomElementWithWeight";
import randomInteger from "../../../utils/random/randomInteger";
import Chain from "../../../core/chain";
import ActionContext from "../../../core/actionContext";
import { ActionProvider } from "../../../core/action";
import getFactoryTokens from "./getFactoryTokens";
import getFactoryPairs from "./getFactoryPairs";
import getLendActions from "./getLendActions";
import getSwapActions from "./getSwapActions";
import getRandomActions from "./getRandomActions";

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
    chain: Chain;
    activeProviders: ActionProvider[];
    context: ActionContext;
  }) {
    const { chain, activeProviders, context } = params;

    const factoryTokens = getFactoryTokens(chain);
    const factoryPairs = getFactoryPairs(factoryTokens);

    const lendActions = getLendActions(activeProviders, factoryTokens, context);
    const swapActions = getSwapActions(activeProviders, factoryPairs, context);
    const randomActions = getRandomActions(activeProviders, chain, context);

    this.routers = OperationFactory.initializeRouters({
      swapActions,
      lendActions,
      randomActions,
    });

    this.totalWeight = Object.values(this.routers)
      .reduce((sum, { weight }) => sum.plus(weight), Big(0))
      .toNumber();
  }

  private static initializeRouters(params: {
    swapActions: SwapAction[];
    lendActions: LendAction[];
    randomActions: RandomAction[];
  }) {
    const { swapActions, lendActions, randomActions } = params;

    const swapEthTokenEthRouter = new SwapEthTokenEthRouter({ swapActions });

    const supplyEthRouter = new SupplyEthRouter({ lendActions });

    const swapSupplyTokenRouter = new SwapSupplyTokenRouter({
      lendActions,
      swapActions,
    });

    const randomRouter = new RandomRouter({ randomActions });

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

    const operations = await router.generateOperationList({ account });

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

    const randomOperations = await value.generateOperationList({ account });

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

  public info() {
    const routesInfo = this.routers.map(
      ({ value }) => `${value.description}: ${value.size()}`,
    );

    return routesInfo;
  }
}

export default OperationFactory;
