import BaseSyncSwapEthToTokenSwap from "./base";
import { BLOCK_SYNC_SWAP_ETH_USDC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class SyncSwapEthUsdcSwap extends BaseSyncSwapEthToTokenSwap {
  name = BLOCK_SYNC_SWAP_ETH_USDC_SWAP;

  constructor(
    chain: Chain,
    minWorkAmountPercent: number,
    maxWorkAmountPercent: number
  ) {
    super(
      chain.getTokenByName("USDC"),
      minWorkAmountPercent,
      maxWorkAmountPercent
    );
  }
}

export default SyncSwapEthUsdcSwap;
