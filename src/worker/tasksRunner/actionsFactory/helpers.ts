import Chain from "../../../core/chain";

export const getChain = (chains: Chain[], name: string) => {
  const chain = chains.find((c) => c.name === name);
  if (!chain) {
    throw new Error("Unexpected error. Linea chain is not defined");
  }
  return chain;
};

export const getChainToken = (chain: Chain, tokenName: string) => {
  const token = chain.tokens.find((t) => t.name === tokenName);
  if (!token) {
    throw new Error(`Token ${tokenName} is not defined in ${chain} chain`);
  }
  return token;
};
