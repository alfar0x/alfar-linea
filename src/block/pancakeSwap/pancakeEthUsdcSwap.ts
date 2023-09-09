import { BLOCK_PANCAKE_ETH_USDC_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BasePancakeEthToTokenSwap from "./base";

class PancakeEthUsdcSwap extends BasePancakeEthToTokenSwap {
  name = BLOCK_PANCAKE_ETH_USDC_SWAP;

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

export default PancakeEthUsdcSwap;
