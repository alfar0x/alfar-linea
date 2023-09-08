import Big from "big.js";

type Num = string | number | Big;

const randomInteger = (min: Num, max: Num) => {
  if (Big(max).lt(min)) {
    throw new Error(`max must be greater than min: ${max} < ${min}`);
  }

  if (Big(max).eq(min)) return Big(min);

  const multiplier = Big(max).minus(min).plus(1);

  return Big(Math.random()).times(multiplier).plus(min).round();
};

export default randomInteger;
