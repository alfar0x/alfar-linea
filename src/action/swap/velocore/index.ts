import { ethers } from "ethers";

import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import arraySortStringsHelper from "../../../utils/array/arraySortStringsHelper";
import SwapAction from "../base";

import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import config from "./config";

class VelocoreSwapAction extends SwapAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: {
    fromToken: Token;
    toToken: Token;
    context: ActionContext;
  }) {
    super({ ...params, provider: "VELOCORE" });

    this.config = config.getChainConfig(params.fromToken.chain);
  }

  private getPackedPool(params: { address: string }) {
    const { operationTypes } = this.config;
    const { address } = params;

    const unusedBytes = 0;

    return ethers.solidityPacked(
      ["uint8", "uint88", "address"],
      [operationTypes.swap, unusedBytes, address],
    );
  }

  private getPackedToken(params: { token: Token }) {
    const { token } = params;
    const { packedEth, tokenTypes } = this.config;
    if (token.isNative) return packedEth;

    const id = 0;

    return ethers.solidityPacked(
      ["uint8", "uint88", "address"],
      [tokenTypes.erc20, id, token.getAddressOrWrappedForNative()],
    );
  }

  private static getPackedTokenInformation(params: {
    index: number;
    amountType: number;
    normalizedAmount: Amount;
  }) {
    const { index, amountType, normalizedAmount } = params;
    const unusedBytes = 0;
    return ethers.solidityPacked(
      ["uint8", "uint8", "uint112", "int128"],
      [index, amountType, unusedBytes, normalizedAmount],
    );
  }

  private async getPool(fromToken: Token, toToken: Token): Promise<string> {
    const { chain } = fromToken;
    const { factoryAddress, factoryContract } = this.config;

    const fromTokenPacked = this.getPackedToken({ token: fromToken });
    const toTokenPacked = this.getPackedToken({ token: toToken });

    const poolAddress = await factoryContract(chain.w3, factoryAddress)
      .methods.pools(fromTokenPacked, toTokenPacked)
      .call();

    if (poolAddress !== ethers.ZeroAddress) return poolAddress;

    const reversedPoolAddress = await this.getPool(toToken, fromToken);

    if (reversedPoolAddress !== ethers.ZeroAddress) return reversedPoolAddress;

    throw new Error(`${fromToken.name} -> ${toToken.name} pool not found`);
  }

  private getSwapCall(params: {
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
    poolAddress: string;
  }) {
    const { normalizedAmount, minOutNormalizedAmount, poolAddress } = params;
    const { vaultAddress, vaultContract, amountTypes } = this.config;
    const { w3 } = this.fromToken.chain;

    const poolId = this.getPackedPool({ address: poolAddress });

    const fromTokenPacked = this.getPackedToken({ token: this.fromToken });
    const toTokenPacked = this.getPackedToken({ token: this.toToken });

    const tokenRef = [fromTokenPacked, toTokenPacked];

    tokenRef.sort(arraySortStringsHelper);

    const deposit = new Array(tokenRef.length).fill(0);

    const fromTokenInformation = VelocoreSwapAction.getPackedTokenInformation({
      index: tokenRef.indexOf(fromTokenPacked),
      amountType: amountTypes.exactly,
      normalizedAmount: normalizedAmount,
    });

    const toTokenInformation = VelocoreSwapAction.getPackedTokenInformation({
      index: tokenRef.indexOf(toTokenPacked),
      amountType: amountTypes.atMost,
      normalizedAmount: minOutNormalizedAmount,
    });

    const tokenInformationList = [fromTokenInformation, toTokenInformation];

    tokenInformationList.sort(arraySortStringsHelper);

    const emptyPool = "0x";

    const swapCall = vaultContract(w3, vaultAddress).methods.execute(
      tokenRef,
      deposit,
      [[poolId, tokenInformationList, emptyPool]],
    );

    return swapCall;
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { vaultAddress } = this.config;

    return await VelocoreSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: vaultAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
    const { slippagePercent, vaultAddress } = this.config;
    const { chain } = this.fromToken;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const poolAddress = await this.getPool(this.fromToken, this.toToken);

    if (!poolAddress) {
      throw new Error(`pool not found`);
    }

    const minOutNormalizedAmount = await this.toToken.getMinOutNormalizedAmount(
      this.fromToken,
      normalizedAmount,
      slippagePercent,
    );

    const swapFunctionCall = this.getSwapCall({
      normalizedAmount,
      minOutNormalizedAmount,
      poolAddress,
    });

    const value = this.fromToken.isNative ? normalizedAmount : 0;

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
      to: vaultAddress,
      value,
    };

    const resultMsg = await this.getDefaultSwapResultMsg({
      normalizedAmount,
      minOutNormalizedAmount,
    });

    return { tx, resultMsg };
  }
}
export default VelocoreSwapAction;
