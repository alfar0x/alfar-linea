import BaseOpenOceanEthToTokenSwap from "./base";
import { BLOCK_OPEN_OCEAN_ETH_WBNB_SWAP } from "../../constants";
import Chain from "../../core/chain";

class OpenOceanEthWbnbSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_WBNB_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("wBNB");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthWbnbSwap;
