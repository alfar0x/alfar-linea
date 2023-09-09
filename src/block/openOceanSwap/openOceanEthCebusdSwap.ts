import { BLOCK_OPEN_OCEAN_ETH_CEBUSD_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseOpenOceanEthToTokenSwap from "./base";

class OpenOceanEthCebusdSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_CEBUSD_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("ceBUSD");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthCebusdSwap;
