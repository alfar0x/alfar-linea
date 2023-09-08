import BaseSyncSwapEthToTokenSwap from "./base";
import { BLOCK_SYNC_SWAP_ETH_WBTC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class SyncSwapEthWbtcSwap extends BaseSyncSwapEthToTokenSwap {
  name = BLOCK_SYNC_SWAP_ETH_WBTC_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("WBTC");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default SyncSwapEthWbtcSwap;
