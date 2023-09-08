import BaseVelocoreEthToTokenSwap from "./base";
import { BLOCK_VELOCORE_ETH_USDC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class VelocoreEthUsdcSwap extends BaseVelocoreEthToTokenSwap {
  name = BLOCK_VELOCORE_ETH_USDC_SWAP;

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

export default VelocoreEthUsdcSwap;
