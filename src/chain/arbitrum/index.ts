import Chain from "../../core/chain";

import contracts from "./contracts";
import rawTokens from "./rawTokens";

type ArbitrumConstructorParams = {
  rpc: string;
};

class Arbitrum extends Chain {
  constructor(params: ArbitrumConstructorParams) {
    const { rpc } = params;

    super({
      name: "Arbitrum",
      chainId: 42161,
      rpc,
      explorer: "https://arbiscan.io",
      rawTokens,
      contracts,
    });
  }
}

export default Arbitrum;
