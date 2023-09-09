import { BLOCK_OPEN_OCEAN_ETH_USDC_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseOpenOceanEthToTokenSwap from "./base";

class OpenOceanEthUsdcSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_USDC_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("USDC");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthUsdcSwap;
