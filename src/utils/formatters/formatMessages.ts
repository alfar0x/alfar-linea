export type Stringable = string | { toString(): string };

const formatMessages = (...stringable: Stringable[]) =>
  stringable.map((str) => String(str)).join(" | ");

export default formatMessages;
