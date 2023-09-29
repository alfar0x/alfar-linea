export const ACTION_TYPE_SWAP = "SWAP";
export const ACTION_TYPE_LEND = "LEND";
export const ACTION_TYPE_RANDOM = "RANDOM";
// export const ACTION_TYPE_BRIDGE = "BRIDGE";

const ACTION_TYPES = [
  ACTION_TYPE_SWAP,
  ACTION_TYPE_LEND,
  ACTION_TYPE_RANDOM,
] as const;

export default ACTION_TYPES;
