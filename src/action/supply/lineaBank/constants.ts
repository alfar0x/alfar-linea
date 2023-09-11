type ChainId = number;
type TokenName = string;
type TokenData = { marketAddress: string };
type ChainData = Record<TokenName, TokenData>;

export const CHAINS_DATA: Record<ChainId, ChainData> = {
  59144: {
    ETH: {
      marketAddress: "0xc7D8489DaE3D2EbEF075b1dB2257E2c231C9D231",
    },
  },
};
