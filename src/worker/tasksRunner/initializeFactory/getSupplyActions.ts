import SupplyAction from "../../../action/supply/base";
import LineaBankSupply from "../../../action/supply/lineaBank";
import { Provider } from "../../../core/action";

import { FactoryTokens } from "./getFactoryTokens";

const getProviderActions = (
  provider: Provider,
  factoryTokens: FactoryTokens,
): SupplyAction[] => {
  switch (provider) {
    case "LINEA_BANK": {
      return [
        new LineaBankSupply({ token: factoryTokens.eth }),
        new LineaBankSupply({ token: factoryTokens.usdc }),
        new LineaBankSupply({ token: factoryTokens.wbtc }),
      ];
    }
    default: {
      return [];
    }
  }
};

const getSupplyActions = (
  activeProviders: Provider[],
  factoryTokens: FactoryTokens,
) =>
  activeProviders.flatMap((provider) =>
    getProviderActions(provider, factoryTokens),
  );

export default getSupplyActions;
