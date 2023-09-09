import BaseSyncSwapEthToTokenSwap from "./base";
import { BLOCK_SYNC_SWAP_ETH_CEBUSD_SWAP } from "../../constants";
import Chain from "../../core/chain";

class SyncSwapEthCebusdSwap extends BaseSyncSwapEthToTokenSwap {
  name = BLOCK_SYNC_SWAP_ETH_CEBUSD_SWAP;

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

export default SyncSwapEthCebusdSwap;
