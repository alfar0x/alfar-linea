/* eslint-disable max-len */
import SwapAction from "../../../action/swap/base";
import OpenOceanSwapAction from "../../../action/swap/openOcean";
import PancakeSwapAction from "../../../action/swap/pancake";
import SyncswapSwapAction from "../../../action/swap/syncswap";
import VelocoreSwapAction from "../../../action/swap/velocore";
import WoofiSwapAction from "../../../action/swap/woofi";
import XyFinanceSwapAction from "../../../action/swap/xyFinance";
import { ActionProvider } from "../../../core/action";
import ActionContext from "../../../core/actionContext";

import { Pairs } from "./getFactoryPairs";

const getProviderActions = (
  provider: ActionProvider,
  pairs: Pairs,
  context: ActionContext,
): SwapAction[] => {
  switch (provider) {
    case "SYNCSWAP": {
      return [
        new SyncswapSwapAction({ ...pairs.eth_usdc, context }),
        // new SyncswapSwapAction({ ...pairs.eth_cebusd, context }),
        new SyncswapSwapAction({ ...pairs.eth_wbtc, context }),

        new SyncswapSwapAction({ ...pairs.usdc_eth, context }),
        // new SyncswapSwapAction({ ...pairs.cebusd_eth, context }),
        new SyncswapSwapAction({ ...pairs.wbtc_eth, context }),
      ];
    }
    case "VELOCORE": {
      return [
        new VelocoreSwapAction({ ...pairs.eth_usdc, context }),
        // new VelocoreSwapAction({ ...pairs.eth_cebusd, context }),

        new VelocoreSwapAction({ ...pairs.usdc_eth, context }),
        // new VelocoreSwapAction({ ...pairs.cebusd_eth, context }),
      ];
    }
    case "OPEN_OCEAN": {
      return [
        new OpenOceanSwapAction({ ...pairs.eth_usdc, context }),
        new OpenOceanSwapAction({ ...pairs.eth_wbtc, context }),
        new OpenOceanSwapAction({ ...pairs.eth_iusd, context }),
        new OpenOceanSwapAction({ ...pairs.eth_izi, context }),
        new OpenOceanSwapAction({ ...pairs.eth_wavax, context }),
        new OpenOceanSwapAction({ ...pairs.eth_wbnb, context }),
        new OpenOceanSwapAction({ ...pairs.eth_wmatic, context }),

        new OpenOceanSwapAction({ ...pairs.usdc_eth, context }),
        new OpenOceanSwapAction({ ...pairs.wbtc_eth, context }),
        new OpenOceanSwapAction({ ...pairs.iusd_eth, context }),
        new OpenOceanSwapAction({ ...pairs.izi_eth, context }),
        new OpenOceanSwapAction({ ...pairs.wavax_eth, context }),
        new OpenOceanSwapAction({ ...pairs.wbnb_eth, context }),
        new OpenOceanSwapAction({ ...pairs.wmatic_eth, context }),
      ];
    }
    case "PANCAKE": {
      return [
        new PancakeSwapAction({ ...pairs.eth_usdc, context }),

        new PancakeSwapAction({ ...pairs.usdc_eth, context }),
      ];
    }
    case "XY_FINANCE": {
      return [
        new XyFinanceSwapAction({ ...pairs.eth_usdc, context }),
        new XyFinanceSwapAction({ ...pairs.eth_usdt, context }),

        new XyFinanceSwapAction({ ...pairs.usdc_eth, context }),
        new XyFinanceSwapAction({ ...pairs.usdt_eth, context }),
      ];
    }
    case "WOOFI": {
      return [
        new WoofiSwapAction({ ...pairs.eth_usdc, context }),

        new WoofiSwapAction({ ...pairs.usdc_eth, context }),
      ];
    }
    // case "ECHO_DEX": {
    //   return [
    //     new EchoDexSwapAction({...pairs.eth_usdc, context}),
    //     new EchoDexSwapAction({...pairs.eth_cebusd, context}),

    //     new EchoDexSwapAction({...pairs.usdc_eth, context}),
    //     new EchoDexSwapAction({...pairs.cebusd_eth, context}),
    //   ];
    // }
    default: {
      return [];
    }
  }
};

const getSwapActions = (
  activeProviders: ActionProvider[],
  pairs: Pairs,
  context: ActionContext,
) =>
  activeProviders.flatMap((provider) =>
    getProviderActions(provider, pairs, context),
  );

export default getSwapActions;
