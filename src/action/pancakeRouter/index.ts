import Action from "../../core/action";
import Account from "../../core/account";
import {
  ACTION_PANCAKE_ROUTER,
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_PANCAKE_FACTORY,
  SLIPPAGE_PERCENT,
} from "../../common/constants";
import Token from "../../core/token";
import getContract from "../../utils/getContract";
import { ethers } from "ethers";
import Chain from "../../core/chain";
import Big from "big.js";

class PancakeRouter extends Action {
  name = ACTION_PANCAKE_ROUTER;
  defaultFee = 500;
  defaultSqrtPriceLimitX96 = 0;

  public getAddressToApprove(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_PANCAKE_SWAP_ROUTER);
  }

  protected async getPool(params: {
    chain: Chain;
    fromToken: Token;
    toToken: Token;
  }) {
    const { chain, fromToken, toToken } = params;

    const poolFactoryContractAddress = chain.getContractAddressByName(
      CONTRACT_PANCAKE_FACTORY
    );

    if (!poolFactoryContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const poolFactoryContract = getContract({
      w3: chain.w3,
      name: CONTRACT_PANCAKE_FACTORY,
      address: poolFactoryContractAddress,
    });

    const poolAddress = await poolFactoryContract.methods
      .getPool(
        fromToken.getAddressOrWrappedForNative(),
        toToken.getAddressOrWrappedForNative(),
        this.defaultFee
      )
      .call();

    return poolAddress;
  }

  private async swapFromEth(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    routerContractAddress: string;
  }) {
    const {
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      routerContractAddress,
    } = params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const deadline = await chain.getSwapDeadline();

    const routerContract = getContract({
      w3,
      name: CONTRACT_PANCAKE_SWAP_ROUTER,
      address: routerContractAddress,
    });

    const exactInputSingleCall = routerContract.methods.exactInputSingle([
      fromToken.getAddressOrWrappedForNative(),
      toToken.getAddressOrWrappedForNative(),
      this.defaultFee,
      account.address,
      normalizedAmount,
      minOutNormalizedAmount,
      this.defaultSqrtPriceLimitX96,
    ]);

    const multicallFunction =
      routerContract.methods["multicall(uint256,bytes[])"];

    const multicallCall = multicallFunction(deadline, [
      exactInputSingleCall.encodeABI(),
    ]);

    return multicallCall;
  }

  private async swapToEthCall(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    routerContractAddress: string;
  }) {
    const {
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      routerContractAddress,
    } = params;

    const { chain } = fromToken;
    const { w3 } = chain;

    const deadline = await chain.getSwapDeadline();

    const routerContract = getContract({
      w3,
      name: CONTRACT_PANCAKE_SWAP_ROUTER,
      address: routerContractAddress,
    });

    const exactInputSingleCall = routerContract.methods.exactInputSingle([
      fromToken.getAddressOrWrappedForNative(),
      toToken.getAddressOrWrappedForNative(),
      this.defaultFee,
      ethers.ZeroAddress,
      normalizedAmount,
      minOutNormalizedAmount,
      this.defaultSqrtPriceLimitX96,
    ]);

    const wrapEthCall = routerContract.methods.unwrapWETH9(
      minOutNormalizedAmount,
      account.address
    );

    const multicallFunction =
      routerContract.methods["multicall(uint256,bytes[])"];

    const multicallCall = multicallFunction(deadline, [
      exactInputSingleCall.encodeABI(),
      wrapEthCall.encodeABI(),
    ]);

    return multicallCall;
  }

  private async getSwapCall(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    routerContractAddress: string;
  }) {
    const {
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      routerContractAddress,
    } = params;

    if (fromToken.isNative) {
      return await this.swapToEthCall({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        minOutNormalizedAmount,
        routerContractAddress,
      });
    }

    if (toToken.isNative) {
      return await this.swapFromEth({
        account,
        fromToken,
        toToken,
        normalizedAmount,
        minOutNormalizedAmount,
        routerContractAddress,
      });
    }

    throw new Error(
      `swap token -> token (not native) is not implemented yet: ${fromToken} -> ${toToken}`
    );
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

    const poolAddress = await this.getPool({ chain, fromToken, toToken });

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

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      SLIPPAGE_PERCENT
    );

    const swapFunctionCall = await this.getSwapCall({
      account,
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      routerContractAddress,
    });

    const estimatedGas = await swapFunctionCall.estimateGas({
      from: account.address,
      value,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data: swapFunctionCall.encodeABI(),
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
