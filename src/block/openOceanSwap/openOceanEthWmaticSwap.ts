import { BLOCK_OPEN_OCEAN_ETH_WMATIC_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseOpenOceanEthToTokenSwap from "./base";

class OpenOceanEthWmaticSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_WMATIC_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("wMATIC");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthWmaticSwap;
