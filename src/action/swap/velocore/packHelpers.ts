import { ethers } from "ethers";

import Token from "../../../core/token";
import { Amount } from "../../../types";

import { OPERATION_TYPES, PACKED_ETH, TOKEN_TYPES } from "./constants";

export const getPackedPool = (params: { address: string }) => {
  const { address } = params;

  const unusedBytes = 0;

  return ethers.solidityPacked(
    ["uint8", "uint88", "address"],
    [OPERATION_TYPES.swap, unusedBytes, address],
  );
};

export const getPackedToken = (params: { token: Token }) => {
  const { token } = params;
  if (token.isNative) return PACKED_ETH;

  const id = 0;

  return ethers.solidityPacked(
    ["uint8", "uint88", "address"],
    [TOKEN_TYPES.erc20, id, token.getAddressOrWrappedForNative()],
  );
};

export const getPackedTokenInformation = (params: {
  index: number;
  amountType: number;
  normalizedAmount: Amount;
}) => {
  const { index, amountType, normalizedAmount } = params;
  const unusedBytes = 0;
  return ethers.solidityPacked(
    ["uint8", "uint8", "uint112", "int128"],
    [index, amountType, unusedBytes, normalizedAmount],
  );
};
