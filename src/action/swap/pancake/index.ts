import Big from "big.js";

import { SLIPPAGE_PERCENT } from "../../../constants";
import {
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_PANCAKE_FACTORY,
  CONTRACT_PANCAKE_QUOTE,
} from "../../../constants/contracts";
import Account from "../../../core/account";
import { SwapAction } from "../../../core/action/swap";
import Chain from "../../../core/chain";
import Token from "../../../core/token";

import {
  FEE,
  GAS_MULTIPLIER,
  SQRT_PRICE_LIMIT_X96,
  UNWRAP_ETH_ADDRESS,
} from "./constants";
import {
  QuoteExactInputSingleResult,
  pancakeFactoryPartialInterface,
  pancakeQuotePartialInterface,
  pancakeRouterPartialInterface,
} from "./interfaces";

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
      CONTRACT_PANCAKE_FACTORY
    );

    if (!poolFactoryContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const getPoolData = pancakeFactoryPartialInterface.encodeFunctionData(
      "getPool",
      [
        fromToken.getAddressOrWrappedForNative(),
        toToken.getAddressOrWrappedForNative(),
        FEE,
      ]
    );

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
      CONTRACT_PANCAKE_QUOTE
    );

    if (!poolQuoteContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const quoteExactInputSingleData =
      pancakeQuotePartialInterface.encodeFunctionData("quoteExactInputSingle", [
        [
          fromToken.getAddressOrWrappedForNative(),
          toToken.getAddressOrWrappedForNative(),
          normalizedAmount,
          FEE,
          SQRT_PRICE_LIMIT_X96,
        ],
      ]);

    const quoteExactInputSingleResult = await chain.w3.eth.call({
      data: quoteExactInputSingleData,
      to: poolQuoteContractAddress,
    });

    const quote = pancakeQuotePartialInterface.decodeFunctionResult(
      "quoteExactInputSingle",
      quoteExactInputSingleResult
    ) as unknown as QuoteExactInputSingleResult;

    const amountOut = quote[0];
    const gasEstimate = quote[3];

    const amount = amountOut.toString();
    const slippageAmount = Big(amount).times(SLIPPAGE_PERCENT).div(100);
    const minOutNormalizedAmount = Big(amount)
      .minus(slippageAmount)
      .round()
      .toString();

    const estimatedGas = Big(gasEstimate.toString())
      .times(GAS_MULTIPLIER)
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
        `swap token -> token (not native) is not implemented yet: ${fromToken} -> ${toToken}`
      );
    }

    const { chain } = fromToken;

    const deadline = await chain.getSwapDeadline();

    const address = toToken.isNative ? UNWRAP_ETH_ADDRESS : account.address;

    const exactInputSingleData =
      pancakeRouterPartialInterface.encodeFunctionData("exactInputSingle", [
        [
          fromToken.getAddressOrWrappedForNative(),
          toToken.getAddressOrWrappedForNative(),
          FEE,
          address,
          normalizedAmount,
          minOutNormalizedAmount,
          SQRT_PRICE_LIMIT_X96,
        ],
      ]);

    const multicallBytesArray = [exactInputSingleData];

    if (toToken.isNative) {
      const unwrapEthData = pancakeRouterPartialInterface.encodeFunctionData(
        "unwrapWETH9",
        [minOutNormalizedAmount, account.address]
      );
      multicallBytesArray.push(unwrapEthData);
    }

    const data = pancakeRouterPartialInterface.encodeFunctionData("multicall", [
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
      CONTRACT_PANCAKE_SWAP_ROUTER
    );

    if (!routerContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`
      );
    }

    const poolAddress = await this.getPool({ fromToken, toToken });

    if (!poolAddress) {
      throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
    }

    if (!fromToken.isNative) {
      const normalizedAllowance = await fromToken.normalizedAllowance(
        account,
        routerContractAddress
      );

      if (Big(normalizedAllowance).lt(normalizedAmount)) {
        const readableAllowance = await fromToken.toReadableAmount(
          normalizedAllowance
        );
        const readableAmount = await fromToken.toReadableAmount(
          normalizedAmount
        );

        throw new Error(
          `account ${fromToken} allowance is less than amount: ${readableAllowance} < ${readableAmount}`
        );
      }
    }

    const normalizedBalance = await fromToken.normalizedBalanceOf(
      account.address
    );

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance = await fromToken.toReadableAmount(
        normalizedBalance
      );
      const readableAmount = await fromToken.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${fromToken} balance is less than amount: ${readableBalance} < ${readableAmount}`
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

    const hash = await account.signAndSendTransaction(chain, tx);

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount
    );

    return { hash, inReadableAmount, outReadableAmount };
  }
}

export default PancakeSwap;
