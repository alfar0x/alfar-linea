import { Provider } from "../../../core/action/types";
import Chain from "../../../core/chain";
import Factory from "../../../factory";
import logger from "../../../utils/other/logger";

import getRandomBlocks from "./getRandomBlocks";
import getSupplyBlocks from "./getSupplyBlocks";
import getSwapBlocks from "./getSwapBlocks";

const initializeFactory = (params: {
  chain: Chain;
  activeProviders: Provider[];
  minWorkAmountPercent: number;
  maxWorkAmountPercent: number;
}) => {
  const { chain, activeProviders, minWorkAmountPercent, maxWorkAmountPercent } =
    params;

  const factory = new Factory({
    swapBlocks: getSwapBlocks({ chain, activeProviders }),
    supplyBlocks: getSupplyBlocks({ chain, activeProviders }),
    randomBlocks: getRandomBlocks({ chain, activeProviders }),
    minWorkAmountPercent,
    maxWorkAmountPercent,
  });

  logger.info(factory.infoString());

  return factory;
};

export default initializeFactory;
