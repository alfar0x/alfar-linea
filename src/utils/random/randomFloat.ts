import Big from "big.js";

const randomFloat = (min: number, max: number, decimals: number) => {
  const multiplier = Big(min).minus(max);

  return Big(Math.random()).times(multiplier).plus(max).toFixed(decimals);
};

export default randomFloat;
