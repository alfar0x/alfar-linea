import Chain from "../../../core/chain";

const getFactoryTokens = (chain: Chain) => {
  const tokens = {
    eth: chain.getTokenByName("ETH"),
    weth: chain.getTokenByName("WETH"),
    usdt: chain.getTokenByName("USDT"),
    usdc: chain.getTokenByName("USDC"),
    dai: chain.getTokenByName("DAI"),
    wbtc: chain.getTokenByName("WBTC"),
    // cebusd: chain.getTokenByName("ceBUSD"),
    iusd: chain.getTokenByName("IUSD"),
    izi: chain.getTokenByName("IZI"),
    wavax: chain.getTokenByName("wAVAX"),
    wmatic: chain.getTokenByName("wMATIC"),
    wbnb: chain.getTokenByName("wBNB"),
  };

  return tokens;
};

export type FactoryTokens = ReturnType<typeof getFactoryTokens>;
export type FactoryTokenKey = keyof FactoryTokens;

export default getFactoryTokens;
