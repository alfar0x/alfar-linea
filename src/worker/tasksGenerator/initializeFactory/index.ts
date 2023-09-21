import { Provider } from "../../../core/action";
import Chain from "../../../core/chain";
import Factory from "../../../factory/taskFactory";

import getFactoryPairs from "./getFactoryPairs";
import getFactoryTokens from "./getFactoryTokens";
import getRandomActions from "./getRandomActions";
import getSupplyActions from "./getSupplyActions";
import getSwapActions from "./getSwapActions";

const initializeFactory = (params: {
  chain: Chain;
  activeProviders: Provider[];
  minWorkAmountPercent: number;
  maxWorkAmountPercent: number;
}) => {
  const { chain, activeProviders, minWorkAmountPercent, maxWorkAmountPercent } =
    params;

  const factoryTokens = getFactoryTokens(chain);
  const factoryPairs = getFactoryPairs(factoryTokens);

  const supplyActions = getSupplyActions(activeProviders, factoryTokens);
  const swapActions = getSwapActions(activeProviders, factoryPairs);
  const randomActions = getRandomActions(activeProviders, chain);

  const factory = new Factory({
    supplyActions,
    swapActions,
    randomActions,
    minWorkAmountPercent,
    maxWorkAmountPercent,
  });

  return factory;
};

export default initializeFactory;
