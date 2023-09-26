import LendAction from "../../../action/lend/base";
import LineaBankLend from "../../../action/lend/lineaBank";
import { Provider } from "../../../core/action";

import { FactoryTokens } from "./getFactoryTokens";

const getProviderActions = (
  provider: Provider,
  factoryTokens: FactoryTokens,
): LendAction[] => {
  switch (provider) {
    case "LINEA_BANK": {
      return [
        new LineaBankLend({ token: factoryTokens.eth }),
        new LineaBankLend({ token: factoryTokens.usdc }),
        new LineaBankLend({ token: factoryTokens.wbtc }),
      ];
    }
    default: {
      return [];
    }
  }
};

const getLendActions = (
  activeProviders: Provider[],
  factoryTokens: FactoryTokens,
) =>
  activeProviders.flatMap((provider) =>
    getProviderActions(provider, factoryTokens),
  );

export default getLendActions;
