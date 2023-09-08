import BaseVelocoreEthToTokenSwap from "./base";
import { BLOCK_VELOCORE_ETH_CEBUSD_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class VelocoreEthCebusdSwap extends BaseVelocoreEthToTokenSwap {
  name = BLOCK_VELOCORE_ETH_CEBUSD_SWAP;

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

export default VelocoreEthCebusdSwap;
