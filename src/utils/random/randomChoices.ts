import randomChoice from "./randomChoice";
import randomShuffle from "./randomShuffle";

const randomChoices = <T>(
  array: T[],
  count: number,
  isDuplicates = true,
): T[] => {
  if (isDuplicates) {
    return Array.from({ length: count }).map(() => randomChoice(array));
  }

  return randomShuffle(array).slice(0, count);
};

export default randomChoices;
