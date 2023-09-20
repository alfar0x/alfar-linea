import OpenOceanSwap from "../../../action/swap/openOcean";
import PancakeSwap from "../../../action/swap/pancake";
import SyncswapSwap from "../../../action/swap/syncswap";
import VelocoreSwap from "../../../action/swap/velocore";
import WoofiSwap from "../../../action/swap/woofi";
import XyFinanceSwap from "../../../action/swap/xyFinance";
import { SwapAction } from "../../../core/action/swap";
import { Provider } from "../../../core/action/types";
import Chain from "../../../core/chain";
import SwapBlock from "../../../core/step/swap";

import tokens from "./tokens";

const availablePairs = {
  ETH_USDC: [
    [tokens.ETH, tokens.USDC],
    [tokens.USDC, tokens.ETH],
  ],
  ETH_WBTC: [
    [tokens.ETH, tokens.WBTC],
    [tokens.WBTC, tokens.ETH],
  ],
  ETH_CEBUSD: [
    [tokens.ETH, tokens.CEBUSD],
    [tokens.CEBUSD, tokens.ETH],
  ],
  ETH_USDT: [
    [tokens.ETH, tokens.USDT],
    [tokens.USDT, tokens.ETH],
  ],
  ETH_IUSD: [
    [tokens.ETH, tokens.IUSD],
    [tokens.IUSD, tokens.ETH],
  ],
  ETH_IZI: [
    [tokens.ETH, tokens.IZI],
    [tokens.IZI, tokens.ETH],
  ],
  ETH_WAVAX: [
    [tokens.ETH, tokens.WAVAX],
    [tokens.WAVAX, tokens.ETH],
  ],
  ETH_WBNB: [
    [tokens.ETH, tokens.WBNB],
    [tokens.WBNB, tokens.ETH],
  ],
  ETH_WMATIC: [
    [tokens.ETH, tokens.WMATIC],
    [tokens.WMATIC, tokens.ETH],
  ],
} as const;

type Pairs = (keyof typeof availablePairs)[];

const getImplementedProviders = (): Partial<
  Record<Provider, [SwapAction, Pairs]>
> => ({
  SYNCSWAP: [new SyncswapSwap(), ["ETH_USDC", "ETH_CEBUSD", "ETH_WBTC"]],
  VELOCORE: [new VelocoreSwap(), ["ETH_USDC", "ETH_CEBUSD"]],
  OPEN_OCEAN: [
    new OpenOceanSwap(),
    [
      "ETH_USDC",
      "ETH_WBTC",
      "ETH_IUSD",
      "ETH_IZI",
      "ETH_WAVAX",
      "ETH_WBNB",
      "ETH_WMATIC",
    ],
  ],
  PANCAKE: [new PancakeSwap(), ["ETH_USDC"]],
  XY_FINANCE: [new XyFinanceSwap(), ["ETH_USDC", "ETH_CEBUSD", "ETH_USDT"]],
  WOOFI: [new WoofiSwap(), ["ETH_USDC"]],
  // ECHO_DEX: [new EchoDexSwap(), ["ETH_USDC", "ETH_CEBUSD"]], // @TODO estimate gas errors fix
});

const getSwapBlocks = (params: {
  activeProviders: Provider[];
  chain: Chain;
}) => {
  const { activeProviders, chain } = params;

  const implementedProviders = getImplementedProviders();

  return activeProviders.flatMap((provider) => {
    const providerData = implementedProviders[provider];

    if (!providerData) return [];

    const [action, pairs] = providerData;

    return pairs
      .flatMap((key) => availablePairs[key])
      .map((pair) => new SwapBlock({ action, chain, pair }));
  });
};

export default getSwapBlocks;
