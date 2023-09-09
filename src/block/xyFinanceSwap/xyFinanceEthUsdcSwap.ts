import BaseXyFinanceEthToTokenSwap from "./base";
import { BLOCK_XY_FINANCE_ETH_USDC_SWAP } from "../../common/constants";
import Chain from "../../core/chain";

class XyFinanceEthUsdcSwap extends BaseXyFinanceEthToTokenSwap {
  name = BLOCK_XY_FINANCE_ETH_USDC_SWAP;

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

export default XyFinanceEthUsdcSwap;
