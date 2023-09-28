import { Provider } from "../../../core/action";
import ActionContext from "../../../core/actionContext";
import Chain from "../../../core/chain";
import Factory from "../operationFactory";

import getFactoryPairs from "./getFactoryPairs";
import getFactoryTokens from "./getFactoryTokens";
import getLendActions from "./getLendActions";
import getRandomActions from "./getRandomActions";
import getSwapActions from "./getSwapActions";

const initializeFactory = (params: {
  chain: Chain;
  activeProviders: Provider[];
  context: ActionContext;
}) => {
  const { chain, activeProviders, context } = params;

  const factoryTokens = getFactoryTokens(chain);
  const factoryPairs = getFactoryPairs(factoryTokens);

  const lendActions = getLendActions(activeProviders, factoryTokens, context);
  const swapActions = getSwapActions(activeProviders, factoryPairs, context);
  const randomActions = getRandomActions(activeProviders, chain, context);

  const factory = new Factory({
    lendActions,
    swapActions,
    randomActions,
  });

  return factory;
};

export default initializeFactory;
