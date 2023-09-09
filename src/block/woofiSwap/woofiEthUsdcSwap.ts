import { BLOCK_WOOFI_ETH_USDC_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseWoofiEthToTokenSwap from "./base";

class WoofiEthUsdcSwap extends BaseWoofiEthToTokenSwap {
  name = BLOCK_WOOFI_ETH_USDC_SWAP;

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

export default WoofiEthUsdcSwap;
