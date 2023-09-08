import BasePancakeEthToTokenSwap from "./base";
import { BLOCK_PANCAKE_ETH_USDC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class PancakeEthUsdcSwap extends BasePancakeEthToTokenSwap {
  name = BLOCK_PANCAKE_ETH_USDC_SWAP;

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

export default PancakeEthUsdcSwap;
