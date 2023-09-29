export type TokenType = "ERC20" | "NATIVE" | "WRAPPED_NATIVE";

export type RawToken = {
  name: string;
  address: string;
  geskoId: string;
  readableDecimals?: number;
  type?: TokenType;
};

export type Amount = number | string;
