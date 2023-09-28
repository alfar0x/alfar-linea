import Chain from "../../core/chain";

import rawTokens from "./rawTokens";

type LineaConstructorParams = {
  rpc: string;
};

class Linea extends Chain {
  public constructor(params: LineaConstructorParams) {
    const { rpc } = params;

    super({
      name: "Linea",
      chainId: 59144,
      rpc,
      explorer: "https://lineascan.build",
      rawTokens,
    });
  }
}

export default Linea;
