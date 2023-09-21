import Token from "../../../core/token";

import { FactoryTokenKey, FactoryTokens } from "./getFactoryTokens";

export type Pairs = Record<
  `${FactoryTokenKey}_${FactoryTokenKey}`,
  { fromToken: Token; toToken: Token }
>;

const getFactoryPairs = (factoryTokens: FactoryTokens) => {
  const tokenKeys = Object.keys(factoryTokens) as FactoryTokenKey[];

  const pairs = tokenKeys.reduce((fromTokenAcc, fromTokenKey) => {
    const fromToken = factoryTokens[fromTokenKey];

    const fromTokenPairs = tokenKeys.reduce((toTokenAcc, toTokenKey) => {
      const toToken = factoryTokens[toTokenKey];
      if (toToken.isEquals(fromToken)) return toTokenAcc;
      return {
        ...toTokenAcc,
        [`${fromTokenKey}_${toTokenKey}`]: { fromToken, toToken },
      };
    }, {} as Pairs);

    return {
      ...fromTokenAcc,
      fromTokenPairs,
    };
  }, {} as Pairs);

  return pairs;
};

export default getFactoryPairs;
