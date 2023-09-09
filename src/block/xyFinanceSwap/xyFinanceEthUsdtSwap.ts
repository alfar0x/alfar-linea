import { BLOCK_XY_FINANCE_ETH_USDT_SWAP } from "../../constants";
import Chain from "../../core/chain";

import BaseXyFinanceEthToTokenSwap from "./base";

class XyFinanceEthUsdtSwap extends BaseXyFinanceEthToTokenSwap {
  name = BLOCK_XY_FINANCE_ETH_USDT_SWAP;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("USDT");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default XyFinanceEthUsdtSwap;
