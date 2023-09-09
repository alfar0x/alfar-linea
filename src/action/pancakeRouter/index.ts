import Action from "../../core/action";
import Account from "../../core/account";
import {
  ACTION_PANCAKE_ROUTER,
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_PANCAKE_FACTORY,
  CONTRACT_PANCAKE_QUOTE,
  SLIPPAGE_PERCENT,
} from "../../constants";
import Token from "../../core/token";
import { ethers } from "ethers";
import Chain from "../../core/chain";
import Big from "big.js";

// ethers encoder used due to web3 js does not support uint24
const pancakeFactoryPartialInterface = new ethers.Interface([
  "function getPool(address, address, uint24) view",
]);

const pancakeRouterPartialInterface = new ethers.Interface([
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
  "function multicall(uint256 deadline, bytes[] data) payable returns (bytes[])",
  "function unwrapWETH9(uint256 amountMinimum, address recipient)",
]);

type QuoteExactInputSingleResult = readonly [bigint, bigint, bigint, bigint];

const pancakeQuotePartialInterface = new ethers.Interface([
  "function quoteExactInputSingle(tuple(address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);

class PancakeRouter extends Action {
  name = ACTION_PANCAKE_ROUTER;
  defaultFee = 100;
  defaultSqrtPriceLimitX96 = 0;
  addressToUnwrapEth = "0x0000000000000000000000000000000000000002";
  defaultGasMultiplier = 2.5;

  public getAddressToApprove(chain: Chain) {
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
        this.defaultFee,
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
          this.defaultFee,
          this.defaultSqrtPriceLimitX96,
        ],
      ]);

    const quoteExactInputSingleResult = await chain.w3.eth.call({
      data: quoteExactInputSingleData,
      to: poolQuoteContractAddress,
    });

    const [amountOut, , , gasEstimate] =
      pancakeQuotePartialInterface.decodeFunctionResult(
        "quoteExactInputSingle",
        quoteExactInputSingleResult
      ) as unknown as QuoteExactInputSingleResult;

    const amount = amountOut.toString();
    const slippageAmount = Big(amount).times(SLIPPAGE_PERCENT).div(100);
    const minOutNormalizedAmount = Big(amount)
      .minus(slippageAmount)
      .round()
      .toString();

    const estimatedGas = Big(gasEstimate.toString())
      .times(this.defaultGasMultiplier)
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

    const address = toToken.isNative
      ? this.addressToUnwrapEth
      : account.address;

    const exactInputSingleData =
      pancakeRouterPartialInterface.encodeFunctionData("exactInputSingle", [
        [
          fromToken.getAddressOrWrappedForNative(),
          toToken.getAddressOrWrappedForNative(),
          this.defaultFee,
          address,
          normalizedAmount,
          minOutNormalizedAmount,
          this.defaultSqrtPriceLimitX96,
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
        `pancake is not available for tokens in different chains: ${fromToken} -> ${toToken}`
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

export default PancakeRouter;
