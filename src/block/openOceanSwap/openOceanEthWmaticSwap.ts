import BaseOpenOceanEthToTokenSwap from "./base";
import { BLOCK_OPEN_OCEAN_ETH_WMATIC_SWAP } from "../../constants";
import Chain from "../../core/chain";

class OpenOceanEthWmaticSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_WMATIC_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("wMATIC");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthWmaticSwap;
