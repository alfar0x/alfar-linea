import { BLOCK_OPEN_OCEAN_ETH_IUSD_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseOpenOceanEthToTokenSwap from "./base";

class OpenOceanEthIusdSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_IUSD_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("IUSD");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthIusdSwap;
