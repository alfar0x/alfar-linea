import Big from "big.js";

type Num = Big | number | string;

const randomInteger = (min: Num, max: Num) => {
  if (Big(max).lt(min)) {
    throw new Error(`max must be greater than min: ${max} < ${min}`);
  }

  if (Big(max).eq(min)) return Big(min);

  const multiplier = Big(max).minus(min);

  return Big(Math.random()).times(multiplier).plus(min).round();
};

export default randomInteger;
