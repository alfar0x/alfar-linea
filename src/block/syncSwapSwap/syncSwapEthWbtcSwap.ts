import BaseSyncSwapEthToTokenSwap from "./base";
import { BLOCK_SYNC_SWAP_ETH_WBTC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class SyncSwapEthWbtcSwap extends BaseSyncSwapEthToTokenSwap {
  name = BLOCK_SYNC_SWAP_ETH_WBTC_SWAP;

  constructor(
    chain: Chain,
    minWorkAmountPercent: number,
    maxWorkAmountPercent: number
  ) {
    super(
      chain.getTokenByName("WBTC"),
      minWorkAmountPercent,
      maxWorkAmountPercent
    );
  }
}

export default SyncSwapEthWbtcSwap;
