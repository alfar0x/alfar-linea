import SwapAction from "../../../action/swap/base";
import OpenOceanSwapAction from "../../../action/swap/openOcean";
import PancakeSwapAction from "../../../action/swap/pancake";
import SyncswapSwapAction from "../../../action/swap/syncswap";
import VelocoreSwapAction from "../../../action/swap/velocore";
import WoofiSwapAction from "../../../action/swap/woofi";
import XyFinanceSwapAction from "../../../action/swap/xyFinance";
import ActionContext from "../../../core/actionContext";
import Chain from "../../../core/chain";
import { getChain, getChainToken } from "./helpers";

const getLineaSwapActions = (
  lineaChain: Chain,
  context: ActionContext,
): SwapAction[] => {
  const eth = getChainToken(lineaChain, "ETH");
  const usdc = getChainToken(lineaChain, "USDC");
  const usdt = getChainToken(lineaChain, "USDT");

  const ethUsdc = { fromToken: eth, toToken: usdc };
  const usdcEth = { fromToken: usdc, toToken: eth };

  const ethUsdt = { fromToken: eth, toToken: usdt };
  const usdtEth = { fromToken: usdt, toToken: eth };

  const lineaSwapActions = [
    new SyncswapSwapAction({ ...ethUsdc, context }),
    new SyncswapSwapAction({ ...usdcEth, context }),
    new SyncswapSwapAction({ ...usdcEth, context }),

    new VelocoreSwapAction({ ...ethUsdc, context }),
    new VelocoreSwapAction({ ...usdcEth, context }),

    new OpenOceanSwapAction({ ...ethUsdc, context }),
    new OpenOceanSwapAction({ ...usdcEth, context }),

    new PancakeSwapAction({ ...ethUsdc, context }),
    new PancakeSwapAction({ ...usdcEth, context }),

    new XyFinanceSwapAction({ ...ethUsdc, context }),
    new XyFinanceSwapAction({ ...ethUsdt, context }),
    new XyFinanceSwapAction({ ...usdcEth, context }),
    new XyFinanceSwapAction({ ...usdtEth, context }),

    new WoofiSwapAction({ ...ethUsdc, context }),
    new WoofiSwapAction({ ...usdcEth, context }),
  ];

  return [...lineaSwapActions];
};

const getSwapActions = (params: {
  chains: Chain[];
  context: ActionContext;
}) => {
  const { chains, context } = params;

  const lineaSwapActions = getLineaSwapActions(
    getChain(chains, "linea"),
    context,
  );

  return [...lineaSwapActions];
};

export default getSwapActions;
