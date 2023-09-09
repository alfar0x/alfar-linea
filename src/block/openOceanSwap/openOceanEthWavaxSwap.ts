import { BLOCK_OPEN_OCEAN_ETH_WAVAX_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseOpenOceanEthToTokenSwap from "./base";

class OpenOceanEthWavaxSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_WAVAX_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("wAVAX");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthWavaxSwap;
