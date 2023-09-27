export type Stringable = string | { toString(): string };

const formatMessage = (...stringable: Stringable[]) =>
  stringable.map((str) => String(str)).join(" | ");

export default formatMessage;
