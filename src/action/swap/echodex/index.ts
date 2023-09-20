import { CONTRACT_ECHO_DEX_SMART_ROUTER } from "../../../abi/constants/contracts";
import {
  DEFAULT_GAS_MULTIPLIER,
  DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
  DEFAULT_SLIPPAGE_PERCENT,
} from "../../../constants";
import Account from "../../../core/account";
import SwapAction from "../../../core/action/swap";
import Token from "../../../core/token";

import { UNWRAP_ETH_ADDRESS } from "./constants";
import RunnableTransaction from "../../../core/transaction";
import getEthersInterface from "../../../abi/methods/getEthersInterface";

class EchoDexSwapAction extends SwapAction {
  constructor() {
    super({ provider: "ECHO_DEX" });
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
        `swap token -> token (not native) is not implemented yet: ${fromToken} -> ${toToken}`,
      );
    }

    const echoDexRouterInterface = getEthersInterface({
      name: "EchoDexSmartRouter",
    });

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
        [minOutNormalizedAmount, account.address],
      );
      multicallBytesArray.push(unwrapEthData);
    }

    const deadline = await chain.getSwapDeadline();

    const data = echoDexRouterInterface.encodeFunctionData(
      "multicall(uint256,bytes[])",
      [deadline, multicallBytesArray],
    );

    return { data };
  }

  private async getSwapTransaction(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    contractAddress: string;
  }) {
    const { account, fromToken, toToken, normalizedAmount, contractAddress } =
      params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      DEFAULT_SLIPPAGE_PERCENT,
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
      to: contractAddress,
    };

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount,
    );

    return { tx, inReadableAmount, outReadableAmount };
  }

  async getTransactions(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;

    const { contractAddress } = await this.basicCheckIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
      contractName: CONTRACT_ECHO_DEX_SMART_ROUTER,
    });

    const txs: RunnableTransaction[] = [];

    const createApproveTransaction = await this.getApproveCreateTransaction({
      account,
      contractAddress,
      token: fromToken,
      normalizedAmount,
    });

    txs.push(
      new RunnableTransaction({
        name: this.getTxName("approve"),
        chain: fromToken.chain,
        account,
        createTransaction: createApproveTransaction,
      }),
    );

    const createSwapTransaction = async () => {
      const { tx, inReadableAmount, outReadableAmount } =
        await this.getSwapTransaction({
          account,
          fromToken,
          toToken,
          normalizedAmount,
          contractAddress,
        });

      const resultMsg = `${inReadableAmount} ${fromToken} -> ${outReadableAmount} ${toToken}`;

      return { tx, resultMsg };
    };

    txs.push(
      new RunnableTransaction({
        name: "swap",
        chain: fromToken.chain,
        account,
        createTransaction: createSwapTransaction,
        gasMultiplier: DEFAULT_GAS_MULTIPLIER,
        retryTimes: DEFAULT_RETRY_MULTIPLY_GAS_TIMES,
      }),
    );

    return { txs };
  }
}

export default EchoDexSwapAction;
