import { ethers } from "ethers";

// ethers encoder used due to web3 js does not support uint24
export const pancakeFactoryPartialInterface = new ethers.Interface([
  "function getPool(address, address, uint24) view",
]);

export const pancakeRouterPartialInterface = new ethers.Interface([
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
  "function multicall(uint256 deadline, bytes[] data) payable returns (bytes[])",
  "function unwrapWETH9(uint256 amountMinimum, address recipient)",
]);

export type QuoteExactInputSingleResult = readonly [
  bigint,
  bigint,
  bigint,
  bigint
];

export const pancakeQuotePartialInterface = new ethers.Interface([
  "function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);
