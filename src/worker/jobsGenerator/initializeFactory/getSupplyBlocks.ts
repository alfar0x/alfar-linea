import LineaBankSupply from "../../../action/supply/lineaBank";
import SupplyBlock from "../../../block/supply";
import { SupplyAction } from "../../../core/action/supply";
import { Provider } from "../../../core/action/types";
import Chain from "../../../core/chain";

import tokens from "./tokens";

type Tokens = (keyof typeof tokens)[];

const getImplementedProviders = (): Partial<
  Record<Provider, [SupplyAction, Tokens]>
> => ({
  LINEA_BANK: [new LineaBankSupply(), ["ETH", "USDC", "WBTC"]],
});

const getSupplyBlocks = (params: {
  activeProviders: Provider[];
  chain: Chain;
}) => {
  const { activeProviders, chain } = params;

  const implementedProviders = getImplementedProviders();

  return activeProviders.flatMap((provider) => {
    const providerData = implementedProviders[provider];

    if (!providerData) return [];

    const [action, providerTokens] = providerData;

    return providerTokens
      .flatMap((key) => tokens[key])
      .map((token) => new SupplyBlock({ action, chain, token }));
  });
};

export default getSupplyBlocks;
