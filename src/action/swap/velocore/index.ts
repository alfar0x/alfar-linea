import Big from "big.js";
import { ethers } from "ethers";

import {
  CONTRACT_VELOCORE_FACTORY,
  CONTRACT_VELOCORE_VAULT,
} from "../../../abi/constants/contracts";
import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import Account from "../../../core/account";
import SwapAction from "../../../core/action/swap";
import Chain from "../../../core/chain";
import Token from "../../../core/token";
import logger from "../../../utils/other/logger";

import {
  AMOUNT_TYPES,
  OPERATION_TYPES,
  PACKED_ETH,
  TOKEN_TYPES,
} from "./constants";

class VelocoreSwapAction extends SwapAction {
  constructor() {
    super({ provider: "VELOCORE" });
  }

  private getPackedPool(params: { address: string }) {
    const { address } = params;

    const unusedBytes = 0;

    return ethers.solidityPacked(
      ["uint8", "uint88", "address"],
      [OPERATION_TYPES.swap, unusedBytes, address],
    );
  }

  private getPackedToken(params: { token: Token }) {
    const { token } = params;
    if (token.isNative) return PACKED_ETH;

    const id = 0;

    return ethers.solidityPacked(
      ["uint8", "uint88", "address"],
      [TOKEN_TYPES.erc20, id, token.getAddressOrWrappedForNative()],
    );
  }

  private getPackedTokenInformation(params: {
    index: number;
    amountType: number;
    normalizedAmount: number | string;
  }) {
    const { index, amountType, normalizedAmount } = params;
    const unusedBytes = 0;
    return ethers.solidityPacked(
      ["uint8", "uint8", "uint112", "int128"],
      [index, amountType, unusedBytes, normalizedAmount],
    );
  }

  private async getPool(params: {
    fromToken: Token;
    toToken: Token;
    isReversed?: boolean;
  }): Promise<string> {
    const { fromToken, toToken, isReversed = false } = params;
    const { chain } = fromToken;

    try {
      const factoryContractAddress = chain.getContractAddressByName(
        CONTRACT_VELOCORE_FACTORY,
      );

      if (!factoryContractAddress) {
        throw new Error(
          `${this.name} action is not available in ${chain.name}`,
        );
      }

      const factoryContract = getWeb3Contract({
        w3: chain.w3,
        name: CONTRACT_VELOCORE_FACTORY,
        address: factoryContractAddress,
      });

      const fromTokenPacked = this.getPackedToken({ token: fromToken });
      const toTokenPacked = this.getPackedToken({ token: toToken });

      const poolAddress = await factoryContract.methods
        .pools(fromTokenPacked, toTokenPacked)
        .call();

      return poolAddress;
    } catch (error) {
      if (isReversed) throw error;
      logger.debug("reversing request");
      return await this.getPool({
        fromToken: toToken,
        toToken: fromToken,
        isReversed: true,
      });
    }
  }

  private async checkIsAllowed(params: {
    account: Account;
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
  }) {
    const { account, fromToken, toToken, normalizedAmount } = params;
    const { chain } = fromToken;

    const contractAddress = chain.getContractAddressByName(
      CONTRACT_VELOCORE_VAULT,
    );

    if (!contractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `action is not available for tokens in different chains: ${fromToken} -> ${toToken}`,
      );
    }

    const poolAddress = await this.getPool({ fromToken, toToken });

    if (!contractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (fromToken.isEquals(toToken)) {
      throw new Error(
        `action is not available for eq tokens: ${fromToken} -> ${toToken}`,
      );
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

    return { contractAddress, poolAddress };
  }

  private getSwapCall(params: {
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    poolAddress: string;
    contractAddress: string;
  }) {
    const {
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      poolAddress,
      contractAddress,
    } = params;

    const poolId = this.getPackedPool({ address: poolAddress });

    const fromTokenPacked = this.getPackedToken({ token: fromToken });
    const toTokenPacked = this.getPackedToken({ token: toToken });

    const tokenRef = [fromTokenPacked, toTokenPacked];

    tokenRef.sort();

    const deposit = new Array(tokenRef.length).fill(0);

    const vaultContract = getWeb3Contract({
      w3: fromToken.chain.w3,
      name: CONTRACT_VELOCORE_VAULT,
      address: contractAddress,
    });

    const fromTokenInformation = this.getPackedTokenInformation({
      index: tokenRef.indexOf(fromTokenPacked),
      amountType: AMOUNT_TYPES.exactly,
      normalizedAmount: normalizedAmount,
    });

    const toTokenInformation = this.getPackedTokenInformation({
      index: tokenRef.indexOf(toTokenPacked),
      amountType: AMOUNT_TYPES.atMost,
      normalizedAmount: minOutNormalizedAmount,
    });

    const tokenInformationList = [fromTokenInformation, toTokenInformation];

    tokenInformationList.sort();

    const emptyPool = "0x";

    const swapCall = vaultContract.methods.execute(tokenRef, deposit, [
      [poolId, tokenInformationList, emptyPool],
    ]);

    return swapCall;
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
    const { contractAddress, poolAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      DEFAULT_SLIPPAGE_PERCENT,
    );

    const swapFunctionCall = this.getSwapCall({
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      poolAddress,
      contractAddress,
    });

    const value = fromToken.isNative ? normalizedAmount : 0;

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
      to: contractAddress,
      value,
    };

    const hash = await account.signAndSendTransaction(chain, tx);

    const inReadableAmount = await fromToken.toReadableAmount(normalizedAmount);
    const outReadableAmount = await toToken.toReadableAmount(
      minOutNormalizedAmount,
    );

    return { hash, inReadableAmount, outReadableAmount };
  }
}
export default VelocoreSwapAction;
