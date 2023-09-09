import BaseOpenOceanEthToTokenSwap from "./base";
import { BLOCK_OPEN_OCEAN_ETH_IZI_SWAP } from "../../constants";
import Chain from "../../core/chain";

class OpenOceanEthIziSwap extends BaseOpenOceanEthToTokenSwap {
  name = BLOCK_OPEN_OCEAN_ETH_IZI_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("IZI");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default OpenOceanEthIziSwap;
