import { BLOCK_SYNC_SWAP_ETH_USDC_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseSyncSwapEthToTokenSwap from "./base";

class SyncSwapEthUsdcSwap extends BaseSyncSwapEthToTokenSwap {
  name = BLOCK_SYNC_SWAP_ETH_USDC_SWAP;

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

export default SyncSwapEthUsdcSwap;
