type ChainId = number;
type TokenName = string;
type TokenData = { marketAddress: string };
type ChainData = Partial<Record<TokenName, TokenData>>;

export const CHAINS_DATA: Partial<Record<ChainId, ChainData>> = {
  59144: {
    ETH: {
      marketAddress: "0xc7D8489DaE3D2EbEF075b1dB2257E2c231C9D231",
    },
    USDC: {
      marketAddress: "0x2aD69A0Cf272B9941c7dDcaDa7B0273E9046C4B0",
    },
    WBTC: {
      marketAddress: "0xEa0F73296a6147FB56bAE29306Aae0FFAfF9De5F",
    },
  },
};
