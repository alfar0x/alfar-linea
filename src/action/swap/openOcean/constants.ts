type ChainId = number;
type ChainData = { chainPath: string };

export const CHAINS_DATA: Record<ChainId, ChainData> = {
  59144: {
    chainPath: "linea",
  },
};

export const API_URL = "https://open-api.openocean.finance/v3";
