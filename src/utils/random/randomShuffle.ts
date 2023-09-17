const randomShuffle = <T>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

export default randomShuffle;
