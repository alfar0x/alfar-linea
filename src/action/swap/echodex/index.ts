import Big from "big.js";

import {
  DEFAULT_GAS_MULTIPLIER,
  DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
  DEFAULT_SLIPPAGE_PERCENT,
} from "../../../constants";
import { CONTRACT_ECHO_DEX_ROUTER } from "../../../constants/contracts";
import Account from "../../../core/account";
import { SwapAction } from "../../../core/action/swap";
import Chain from "../../../core/chain";
import Token from "../../../core/token";
import getInterface from "../../../utils/ethers/getInterface";

import { UNWRAP_ETH_ADDRESS } from "./constants";

class EchoDexSwap extends SwapAction {
  constructor() {
    super({ provider: "ECHO_DEX" });
  }

  public getApproveAddress(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_ECHO_DEX_ROUTER);
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
      CONTRACT_ECHO_DEX_ROUTER
    );

    if (!routerContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`
      );
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

    const { chain } = fromToken;

    if (!fromToken.isNative && !toToken.isNative) {
      throw new Error(
        `swap token -> token (not native) is not implemented yet: ${fromToken} -> ${toToken}`
      );
    }

    const echoDexRouterInterface = getInterface({ name: "EchoDexRouter" });

    const address = toToken.isNative ? UNWRAP_ETH_ADDRESS : account.address;

    const swapExactTokensForTokensData =
      echoDexRouterInterface.encodeFunctionData("swapExactTokensForTokens", [
        normalizedAmount,
        minOutNormalizedAmount,
        [
          fromToken.getAddressOrWrappedForNative(),
          toToken.getAddressOrWrappedForNative(),
        ],
        address,
      ]);

    const multicallBytesArray = [swapExactTokensForTokensData];

    if (toToken.isNative) {
      const unwrapEthData = echoDexRouterInterface.encodeFunctionData(
        "unwrapWETH9",
        [minOutNormalizedAmount, account.address]
      );
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = echoDexRouterInterface.encodeFunctionData(
      "multicall(uint256,bytes[])",
      [deadline, multicallBytesArray]
    );

    return { data };
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

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      DEFAULT_SLIPPAGE_PERCENT
    );

    const { data } = await this.getSwapData({
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
    });

    const value = fromToken.isNative ? normalizedAmount : 0;

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const estimatedGas = "200000"; // @TODO estimate gas

    const tx = {
      data,
      from: account.address,
      value,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: routerContractAddress,
    };

    console.log(tx);

    // const hash = await account.signAndSendTransaction(chain, tx, {
    //   retry: {
    //     gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    //     times: DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
    //   },
    // });

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount
    );

    return { hash: "", inReadableAmount, outReadableAmount };
  }
}

export default EchoDexSwap;
