type Item = { key: string; value: string | number | boolean };

const formatObjectsWithKeyPad = (array: Item[], padIncrease = 1): string => {
  const maxLength = Math.max(...array.map(({ key }) => key.length));

  const padSize = maxLength + padIncrease;

  const result: string[] = array.map(({ key, value }) => {
    return `${key.padEnd(padSize)} : ${value}`;
  });

  return result.join("\n");
};

export default formatObjectsWithKeyPad;
