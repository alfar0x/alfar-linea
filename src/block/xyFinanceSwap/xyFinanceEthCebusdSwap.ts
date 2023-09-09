import BaseXyFinanceEthToTokenSwap from "./base";
import { BLOCK_XY_FINANCE_ETH_CEBUSD_SWAP } from "../../constants";
import Chain from "../../core/chain";

class XyFinanceEthCebusdSwap extends BaseXyFinanceEthToTokenSwap {
  name = BLOCK_XY_FINANCE_ETH_CEBUSD_SWAP;

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

export default XyFinanceEthCebusdSwap;
