export type Stringable = string | { toString(): string };

const createMessage = (...stringable: Stringable[]) =>
  stringable.map((str) => String(str)).join(" | ");

export default createMessage;
