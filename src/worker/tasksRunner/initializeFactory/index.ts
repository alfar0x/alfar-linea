import { Provider } from "../../../core/action";
import Chain from "../../../core/chain";
import Factory from "../../../factory/operationFactory";

import getFactoryPairs from "./getFactoryPairs";
import getFactoryTokens from "./getFactoryTokens";
import getLendActions from "./getLendActions";
import getRandomActions from "./getRandomActions";
import getSwapActions from "./getSwapActions";

const initializeFactory = (params: {
  chain: Chain;
  activeProviders: Provider[];
  minWorkAmountPercent: number;
  maxWorkAmountPercent: number;
  minApproveMultiplier: number;
  maxApproveMultiplier: number;
}) => {
  const {
    chain,
    activeProviders,
    minWorkAmountPercent,
    maxWorkAmountPercent,
    minApproveMultiplier,
    maxApproveMultiplier,
  } = params;

  const factoryTokens = getFactoryTokens(chain);
  const factoryPairs = getFactoryPairs(factoryTokens);

  const lendActions = getLendActions(activeProviders, factoryTokens);
  const swapActions = getSwapActions(activeProviders, factoryPairs);
  const randomActions = getRandomActions(activeProviders, chain);

  const factory = new Factory({
    lendActions,
    swapActions,
    randomActions,
    minWorkAmountPercent,
    maxWorkAmountPercent,
    minApproveMultiplier,
    maxApproveMultiplier,
  });

  return factory;
};

export default initializeFactory;
