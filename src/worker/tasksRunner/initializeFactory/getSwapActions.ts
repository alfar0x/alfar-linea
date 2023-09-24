/* eslint-disable max-len */
import SwapAction from "../../../action/swap/base";
import OpenOceanSwapAction from "../../../action/swap/openOcean";
import PancakeSwapAction from "../../../action/swap/pancake";
import SyncswapSwapAction from "../../../action/swap/syncswap";
import VelocoreSwapAction from "../../../action/swap/velocore";
import WoofiSwapAction from "../../../action/swap/woofi";
import XyFinanceSwapAction from "../../../action/swap/xyFinance";
import { Provider } from "../../../core/action";

import { Pairs } from "./getFactoryPairs";

const getProviderActions = (provider: Provider, pairs: Pairs): SwapAction[] => {
  switch (provider) {
    case "SYNCSWAP": {
      return [
        new SyncswapSwapAction(pairs.eth_usdc),
        new SyncswapSwapAction(pairs.eth_cebusd),
        new SyncswapSwapAction(pairs.eth_wbtc),

        new SyncswapSwapAction(pairs.usdc_eth),
        new SyncswapSwapAction(pairs.cebusd_eth),
        new SyncswapSwapAction(pairs.wbtc_eth),
      ];
    }
    case "VELOCORE": {
      return [
        new VelocoreSwapAction(pairs.eth_usdc),
        new VelocoreSwapAction(pairs.eth_cebusd),

        new VelocoreSwapAction(pairs.usdc_eth),
        new VelocoreSwapAction(pairs.cebusd_eth),
      ];
    }
    case "OPEN_OCEAN": {
      return [
        new OpenOceanSwapAction(pairs.eth_usdc),
        new OpenOceanSwapAction(pairs.eth_wbtc),
        new OpenOceanSwapAction(pairs.eth_iusd),
        new OpenOceanSwapAction(pairs.eth_izi),
        new OpenOceanSwapAction(pairs.eth_wavax),
        new OpenOceanSwapAction(pairs.eth_wbnb),
        new OpenOceanSwapAction(pairs.eth_wmatic),

        new OpenOceanSwapAction(pairs.usdc_eth),
        new OpenOceanSwapAction(pairs.wbtc_eth),
        new OpenOceanSwapAction(pairs.iusd_eth),
        new OpenOceanSwapAction(pairs.izi_eth),
        new OpenOceanSwapAction(pairs.wavax_eth),
        new OpenOceanSwapAction(pairs.wbnb_eth),
        new OpenOceanSwapAction(pairs.wmatic_eth),
      ];
    }
    case "PANCAKE": {
      return [
        new PancakeSwapAction(pairs.eth_usdc),

        new PancakeSwapAction(pairs.usdc_eth),
      ];
    }
    case "XY_FINANCE": {
      return [
        new XyFinanceSwapAction(pairs.eth_usdc),
        new XyFinanceSwapAction(pairs.eth_usdt),

        new XyFinanceSwapAction(pairs.usdc_eth),
        new XyFinanceSwapAction(pairs.usdt_eth),
      ];
    }
    case "WOOFI": {
      return [
        new WoofiSwapAction(pairs.eth_usdc),

        new WoofiSwapAction(pairs.usdc_eth),
      ];
    }
    // case "ECHO_DEX": {
    //   return [
    //     new EchoDexSwapAction(pairs.eth_usdc),
    //     new EchoDexSwapAction(pairs.eth_cebusd),

    //     new EchoDexSwapAction(pairs.usdc_eth),
    //     new EchoDexSwapAction(pairs.cebusd_eth),
    //   ];
    // }
    default: {
      return [];
    }
  }
};

const getSwapActions = (activeProviders: Provider[], pairs: Pairs) =>
  activeProviders.flatMap((provider) => getProviderActions(provider, pairs));

export default getSwapActions;
