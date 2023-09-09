
import DmailSendMail from "../../block/dmail/dmailSendMail";
import OpenOceanEthCebusdSwap from "../../block/openOceanSwap/openOceanEthCebusdSwap";
import OpenOceanEthIusdSwap from "../../block/openOceanSwap/openOceanEthIusdSwap";
import OpenOceanEthIziSwap from "../../block/openOceanSwap/openOceanEthIziSwap";
import OpenOceanEthUsdcSwap from "../../block/openOceanSwap/openOceanEthUsdcSwap";
import OpenOceanEthWavaxSwap from "../../block/openOceanSwap/openOceanEthWavaxSwap";
import OpenOceanEthWbnbSwap from "../../block/openOceanSwap/openOceanEthWbnbSwap";
import OpenOceanEthWmaticSwap from "../../block/openOceanSwap/openOceanEthWmaticSwap";
import PancakeEthUsdcSwap from "../../block/pancakeSwap/pancakeEthUsdcSwap";
import SyncSwapEthCebusdSwap from "../../block/syncSwapSwap/syncSwapEthCebusdSwap";
import SyncSwapEthUsdcSwap from "../../block/syncSwapSwap/syncSwapEthUsdcSwap";
import SyncSwapEthWbtcSwap from "../../block/syncSwapSwap/syncSwapEthWbtcSwap";
import VelocoreEthCebusdSwap from "../../block/velocoreSwap/velocoreEthCebusdSwap";
import VelocoreEthUsdcSwap from "../../block/velocoreSwap/velocoreEthUsdcSwap";
import XyFinanceEthCebusdSwap from "../../block/xyFinanceSwap/xyFinanceEthCebusdSwap";
import XyFinanceEthUsdcSwap from "../../block/xyFinanceSwap/xyFinanceEthUsdcSwap";
import XyFinanceEthUsdtSwap from "../../block/xyFinanceSwap/xyFinanceEthUsdtSwap";
import Chain from "../../core/chain";

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
    new OpenOceanEthCebusdSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new OpenOceanEthIusdSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new OpenOceanEthIziSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new OpenOceanEthUsdcSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new OpenOceanEthWavaxSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new OpenOceanEthWbnbSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new OpenOceanEthWmaticSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new XyFinanceEthCebusdSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new XyFinanceEthUsdcSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new XyFinanceEthUsdtSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
    new PancakeEthUsdcSwap({
      chain,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    }),
  ];
};

export default initializeBlocks;
