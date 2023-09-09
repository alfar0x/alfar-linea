const randomChoice = <T>(array: T[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

export default randomChoice;
