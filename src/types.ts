export type TokenType = "NATIVE" | "WRAPPED_NATIVE" | "ERC20";

export type RawToken = {
  name: string;
  address: string;
  geskoId: string;
  readableDecimals?: number;
  type?: TokenType;
};

export type Amount = number | string;
