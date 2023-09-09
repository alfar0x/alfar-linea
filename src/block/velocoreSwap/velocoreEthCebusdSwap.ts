import BaseVelocoreEthToTokenSwap from "./base";
import { BLOCK_VELOCORE_ETH_CEBUSD_SWAP } from "../../constants";
import Chain from "../../core/chain";

class VelocoreEthCebusdSwap extends BaseVelocoreEthToTokenSwap {
  name = BLOCK_VELOCORE_ETH_CEBUSD_SWAP;

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

export default VelocoreEthCebusdSwap;
