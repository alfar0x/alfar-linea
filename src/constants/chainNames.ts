export const CHAIN_NAME_LINEA = "linea";
export const CHAIN_NAME_ARBITRUM = "arbitrum";

const CHAIN_NAMES = [CHAIN_NAME_ARBITRUM, CHAIN_NAME_LINEA] as const;

export type ChainName = (typeof CHAIN_NAMES)[number];

export default CHAIN_NAMES;
