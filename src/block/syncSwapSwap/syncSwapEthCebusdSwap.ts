import BaseSyncSwapEthToTokenSwap from "./base";
import { BLOCK_SYNC_SWAP_ETH_CEBUSD_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class SyncSwapEthCebusdSwap extends BaseSyncSwapEthToTokenSwap {
  name = BLOCK_SYNC_SWAP_ETH_CEBUSD_SWAP;

  constructor(
    chain: Chain,
    minWorkAmountPercent: number,
    maxWorkAmountPercent: number
  ) {
    super(
      chain.getTokenByName("ceBUSD"),
      minWorkAmountPercent,
      maxWorkAmountPercent
    );
  }
}

export default SyncSwapEthCebusdSwap;
