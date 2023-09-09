import Action from "../../core/action";
import Account from "../../core/account";
import {
  ACTION_VELOCORE_VAULT,
  CONTRACT_VELOCORE_FACTORY,
  CONTRACT_VELOCORE_VAULT,
  SLIPPAGE_PERCENT,
} from "../../constants";
import Token from "../../core/token";
import getContract from "../../utils/getContract";
import { ethers } from "ethers";
import Big from "big.js";
import Chain from "../../core/chain";
import logger from "../../utils/logger";

const tokenTypes = {
  erc20: 0,
  erc721: 1,
  erc1155: 2,
};

const amountTypes = {
  exactly: 0,
  at_most: 1,
  all: 2,
};

const operationTypes = {
  swap: 0,
};

class VelocoreVault extends Action {
  name = ACTION_VELOCORE_VAULT;
  ethPacked =
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

  public getAddressToApprove(chain: Chain) {
    return chain.getContractAddressByName(CONTRACT_VELOCORE_VAULT);
  }

  private getPackedPool(params: { address: string }) {
    const { address } = params;

    const unusedBytes = 0;

    return ethers.solidityPacked(
      ["uint8", "uint88", "address"],
      [operationTypes.swap, unusedBytes, address]
    );
  }

  private getPackedToken(params: { token: Token }) {
    const { token } = params;
    if (token.isNative) return this.ethPacked;

    const id = 0;

    return ethers.solidityPacked(
      ["uint8", "uint88", "address"],
      [tokenTypes.erc20, id, token.getAddressOrWrappedForNative()]
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
      [index, amountType, unusedBytes, normalizedAmount]
    );
  }

  private async getPool(params: {
    chain: Chain;
    fromToken: Token;
    toToken: Token;
    isReversed?: boolean;
  }): Promise<string> {
    const { chain, fromToken, toToken, isReversed = false } = params;

    try {
      const factoryContractAddress = chain.getContractAddressByName(
        CONTRACT_VELOCORE_FACTORY
      );

      if (!factoryContractAddress) {
        throw new Error(
          `${this.name} action is not available in ${chain.name}`
        );
      }

      const factoryContract = getContract({
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
        chain,
        toToken,
        fromToken,
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

    const vaultContractAddress = chain.getContractAddressByName(
      CONTRACT_VELOCORE_VAULT
    );

    if (!vaultContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    if (!fromToken.chain.isEquals(toToken.chain)) {
      throw new Error(
        `syncswap is not available for tokens in different chains: ${fromToken} -> ${toToken}`
      );
    }

    const poolAddress = await this.getPool({ chain, fromToken, toToken });

    if (poolAddress === ethers.ZeroAddress) {
      throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
    }

    if (!fromToken.isNative) {
      const normalizedAllowance = await fromToken.normalizedAllowance(
        account,
        vaultContractAddress
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

    return { vaultContractAddress, poolAddress };
  }

  private async getSwapCall(params: {
    fromToken: Token;
    toToken: Token;
    normalizedAmount: number | string;
    minOutNormalizedAmount: number | string;
    poolAddress: string;
    vaultContractAddress: string;
  }) {
    const {
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      poolAddress,
      vaultContractAddress,
    } = params;

    const poolId = this.getPackedPool({ address: poolAddress });

    const fromTokenPacked = this.getPackedToken({ token: fromToken });
    const toTokenPacked = this.getPackedToken({ token: toToken });

    const tokenRef = [fromTokenPacked, toTokenPacked];

    tokenRef.sort();

    const deposit = new Array(tokenRef.length).fill(0);

    const vaultContract = getContract({
      w3: fromToken.chain.w3,
      name: CONTRACT_VELOCORE_VAULT,
      address: vaultContractAddress,
    });

    const fromTokenInformation = this.getPackedTokenInformation({
      index: tokenRef.indexOf(fromTokenPacked),
      amountType: amountTypes.exactly,
      normalizedAmount: normalizedAmount,
    });

    const toTokenInformation = this.getPackedTokenInformation({
      index: tokenRef.indexOf(toTokenPacked),
      amountType: amountTypes.at_most,
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
    const { vaultContractAddress, poolAddress } = await this.checkIsAllowed({
      account,
      fromToken,
      toToken,
      normalizedAmount,
    });

    const minOutNormalizedAmount = await toToken.getMinOutNormalizedAmount(
      fromToken,
      normalizedAmount,
      SLIPPAGE_PERCENT
    );

    const swapFunctionCall = await this.getSwapCall({
      fromToken,
      toToken,
      normalizedAmount,
      minOutNormalizedAmount,
      poolAddress,
      vaultContractAddress,
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
      to: vaultContractAddress,
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
export default VelocoreVault;
