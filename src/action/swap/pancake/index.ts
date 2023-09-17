import Big from "big.js";

import {
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_PANCAKE_FACTORY,
  CONTRACT_PANCAKE_QUOTE,
} from "../../../abi/constants/contracts";
import getEthersInterface from "../../../abi/methods/getEthersInterface";
import {
  DEFAULT_GAS_MULTIPLIER,
  DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
  DEFAULT_SLIPPAGE_PERCENT,
} from "../../../constants";
import Account from "../../../core/account";
import { SwapAction } from "../../../core/action/swap";
import Chain from "../../../core/chain";
import Token from "../../../core/token";

import {
  FEE,
  INITIAL_GAS_MULTIPLIER,
  SQRT_PRICE_LIMIT_X96,
  UNWRAP_ETH_ADDRESS,
} from "./constants";

class PancakeSwap extends SwapAction {
  constructor() {
    super({ provider: "PANCAKE" });
  }

  public getApproveAddress(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_PANCAKE_SWAP_ROUTER);
  }

  async getPool(params: { fromToken: Token; toToken: Token }) {
    const { fromToken, toToken } = params;
    const { chain } = fromToken;

    const poolFactoryContractAddress = chain.getContractAddressByName(
      CONTRACT_PANCAKE_FACTORY,
    );

    if (!poolFactoryContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const pancakeFactoryInterface = getEthersInterface({
      name: "PancakeFactory",
    });

    const getPoolData = pancakeFactoryInterface.encodeFunctionData("getPool", [
      fromToken.getAddressOrWrappedForNative(),
      toToken.getAddressOrWrappedForNative(),
      FEE,
    ]);

    const poolAddress = await chain.w3.eth.call({
      data: getPoolData,
      to: poolFactoryContractAddress,
    });

    return poolAddress;
  }

  private async getQuote(params: {
    chain: Chain;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: string | number;
  }) {
    const { chain, fromToken, toToken, normalizedAmount } = params;

    const poolQuoteContractAddress = chain.getContractAddressByName(
      CONTRACT_PANCAKE_QUOTE,
    );

    if (!poolQuoteContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const pancakeQuoteInterface = getEthersInterface({ name: "PancakeQuote" });

    const quoteExactInputSingleData = pancakeQuoteInterface.encodeFunctionData(
      "quoteExactInputSingle",
      [
        {
          tokenIn: fromToken.getAddressOrWrappedForNative(),
          tokenOut: toToken.getAddressOrWrappedForNative(),
          amountIn: normalizedAmount,
          fee: FEE,
          sqrtPriceLimitX96: SQRT_PRICE_LIMIT_X96,
        },
      ],
    );

    const quoteExactInputSingleResult = await chain.w3.eth.call({
      data: quoteExactInputSingleData,
      to: poolQuoteContractAddress,
    });

    const quote = pancakeQuoteInterface.decodeFunctionResult(
      "quoteExactInputSingle",
      quoteExactInputSingleResult,
    );

    const amountOut = quote[0];
    const gasEstimate = quote[3];

    const amount = amountOut.toString();
    const slippageAmount = Big(amount).times(DEFAULT_SLIPPAGE_PERCENT).div(100);
    const minOutNormalizedAmount = Big(amount)
      .minus(slippageAmount)
      .round()
      .toString();

    const estimatedGas = Big(gasEstimate.toString())
      .times(INITIAL_GAS_MULTIPLIER)
      .round()
      .toString();

    return { minOutNormalizedAmount, estimatedGas };
  }

  private async getSwapData(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
  }) {
    const {
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
    } = params;

    if (!fromToken.isNative && !toToken.isNative) {
      throw new Error(
        `swap token -> token (not native) is not implemented yet: ${fromToken} -> ${toToken}`,
      );
    }

    const { chain } = fromToken;

    const pancakeRouterInterface = getEthersInterface({
      name: "PancakeSwapRouter",
    });

    const address = toToken.isNative ? UNWRAP_ETH_ADDRESS : account.address;

    const exactInputSingleData = pancakeRouterInterface.encodeFunctionData(
      "exactInputSingle",
      [
        {
          tokenIn: fromToken.getAddressOrWrappedForNative(),
          tokenOut: toToken.getAddressOrWrappedForNative(),
          fee: FEE,
          recipient: address,
          amountIn: normalizedAmount,
          amountOutMinimum: minOutNormalizedAmount,
          sqrtPriceLimitX96: SQRT_PRICE_LIMIT_X96,
        },
      ],
    );

    const multicallBytesArray = [exactInputSingleData];

    if (toToken.isNative) {
      const unwrapEthData = pancakeRouterInterface.encodeFunctionData(
        "unwrapWETH9",
        [minOutNormalizedAmount, account.address],
      );
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = pancakeRouterInterface.encodeFunctionData("multicall", [
      deadline,
      multicallBytesArray,
    ]);

    return { data };
  }

  private async checkIsAllowed(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chain } = fromToken;

    const routerContractAddress = chain.getContractAddressByName(
      CONTRACT_PANCAKE_SWAP_ROUTER,
    );

    if (!routerContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`,
      );
    }

    const poolAddress = await this.getPool({ fromToken, toToken });

    if (!poolAddress) {
      throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
    }

    if (!fromToken.isNative) {
      const normalizedAllowance = await fromToken.normalizedAllowance(
        account,
        routerContractAddress,
      );

      if (Big(normalizedAllowance).lt(normalizedAmount)) {
        const readableAllowance =
          await fromToken.toReadableAmount(normalizedAllowance);
        const readableAmount =
          await fromToken.toReadableAmount(normalizedAmount);

        throw new Error(
          `account ${fromToken} allowance is less than amount: ${readableAllowance} < ${readableAmount}`,
        );
      }
    }

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address,
    );

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance =
        await fromToken.toReadableAmount(normalizedBalance);
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${fromToken} balance is less than amount: ${readableBalance} < ${readableAmount}`,
      );
    }

    return { routerContractAddress };
  }

  async swap(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { chain } = fromToken;
    const { w3 } = chain;
    const { routerContractAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const value = fromToken.isNative ? normalizedAmount : 0;

    const { minOutNormalizedAmount, estimatedGas } = await this.getQuote({
      chain,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const { data } = await this.getSwapData({
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data,
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: routerContractAddress,
      value,
    };

    const hash = await account.signAndSendTransaction(chain, tx, {
      retry: {
        gasMultiplier: DEFAULT_GAS_MULTIPLIER,
        times: DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
      },
    });

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount,
    );

    return { hash, inReadableAmount, outReadableAmount };
  }
}

export default PancakeSwap;
