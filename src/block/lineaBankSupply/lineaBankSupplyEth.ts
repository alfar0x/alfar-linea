import { BLOCK_LINEA_BANK_SUPPLY_ETH } from "../../constants";
import Chain from "../../core/chain";

import BaseLineaBankSupply from "./base";

class LineaBankSupplyEth extends BaseLineaBankSupply {
  name = BLOCK_LINEA_BANK_SUPPLY_ETH;

  constructor(params: {
    chain: Chain;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { chain, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const token = chain.getTokenByName("ETH");

    super({ token, minWorkAmountPercent, maxWorkAmountPercent });
  }
}

export default LineaBankSupplyEth;
