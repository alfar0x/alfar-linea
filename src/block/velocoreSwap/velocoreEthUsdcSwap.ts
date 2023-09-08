import BaseVelocoreEthToTokenSwap from "./base";
import { BLOCK_VELOCORE_ETH_USDC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class VelocoreEthUsdcSwap extends BaseVelocoreEthToTokenSwap {
  name = BLOCK_VELOCORE_ETH_USDC_SWAP;

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

export default VelocoreEthUsdcSwap;
