import Chain from "../../core/chain";

import SyncSwapEthUsdcSwap from "../../block/syncSwapSwap/syncSwapEthUsdcSwap";
import SyncSwapEthWbtcSwap from "../../block/syncSwapSwap/syncSwapEthWbtcSwap";
import DmailSendMail from "../../block/dmail/dmailSendMail";
import VelocoreEthUsdcSwap from "../../block/velocoreSwap/velocoreEthUsdcSwap";
import VelocoreEthCebusdSwap from "../../block/velocoreSwap/velocoreEthCebusdSwap";
import SyncSwapEthCebusdSwap from "../../block/syncSwapSwap/syncSwapEthCebusdSwap";

const initializeBlocks = (params: {
  chain: Chain;
  minWorkAmountPercent: number;
  maxWorkAmountPercent: number;
}) => {
  const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;
  return [
    new SyncSwapEthUsdcSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new SyncSwapEthWbtcSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new SyncSwapEthCebusdSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new VelocoreEthUsdcSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new VelocoreEthCebusdSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new DmailSendMail({ chain }),
  ];
};

export default initializeBlocks;
