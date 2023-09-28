import LendAction from "../../../action/lend/base";
import LineaBankLend from "../../../action/lend/lineaBank";
import { Provider } from "../../../core/action";
import ActionContext from "../../../core/actionContext";

import { FactoryTokens } from "./getFactoryTokens";

const getProviderActions = (
  provider: Provider,
  factoryTokens: FactoryTokens,
  context: ActionContext,
): LendAction[] => {
  switch (provider) {
    case "LINEA_BANK": {
      return [
        new LineaBankLend({ token: factoryTokens.eth, context }),
        new LineaBankLend({ token: factoryTokens.usdc, context }),
        new LineaBankLend({ token: factoryTokens.wbtc, context }),
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
  context: ActionContext,
) =>
  activeProviders.flatMap((provider) =>
    getProviderActions(provider, factoryTokens, context),
  );

export default getLendActions;
