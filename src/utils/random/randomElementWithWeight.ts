import Big from "big.js";

import randomChoice from "./randomChoice";

type Item<T> = {
  value: T;
  weight: number;
};

const randomElementWithWeight = <T>(arr: Item<T>[]) => {
  const totalWeight = arr
    .reduce((acc, item) => acc.plus(item.weight), Big(0))
    .toNumber();

  let randomValue = Math.random() * totalWeight;

  for (const { value, weight } of arr) {
    randomValue -= weight;

    if (randomValue <= 0) return value;
  }

  return randomChoice(arr).value as never;
};

export default randomElementWithWeight;
