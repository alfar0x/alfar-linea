import { ethers } from "ethers";

import {
  CONTRACT_VELOCORE_FACTORY,
  CONTRACT_VELOCORE_VAULT,
} from "../../../abi/constants/contracts";
import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import sortStringsHelper from "../../../utils/other/sortStringsHelper";
import SwapAction from "../base";

import { AMOUNT_TYPES } from "./constants";
import {
  getPackedPool,
  getPackedToken,
  getPackedTokenInformation,
} from "./packHelpers";

class VelocoreSwapAction extends SwapAction {
  private readonly vaultContractAddress: string;
  private readonly factoryContractAddress: string;

  public constructor(params: { fromToken: Token; toToken: Token }) {
    super(params);

    this.initializeName({ provider: "VELOCORE" });

    this.vaultContractAddress = this.getContractAddress({
      contractName: CONTRACT_VELOCORE_VAULT,
    });

    this.factoryContractAddress = this.getContractAddress({
      contractName: CONTRACT_VELOCORE_FACTORY,
    });
  }

  private async getPool(fromToken: Token, toToken: Token): Promise<string> {
    const { chain } = fromToken;

    const factoryContract = getWeb3Contract({
      w3: chain.w3,
      name: CONTRACT_VELOCORE_FACTORY,
      address: this.factoryContractAddress,
    });

    const fromTokenPacked = getPackedToken({ token: fromToken });
    const toTokenPacked = getPackedToken({ token: toToken });

    const poolAddress = await factoryContract.methods
      .pools(fromTokenPacked, toTokenPacked)
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

    const poolId = getPackedPool({ address: poolAddress });

    const fromTokenPacked = getPackedToken({ token: this.fromToken });
    const toTokenPacked = getPackedToken({ token: this.toToken });

    const tokenRef = [fromTokenPacked, toTokenPacked];

    tokenRef.sort(sortStringsHelper);

    const deposit = new Array(tokenRef.length).fill(0);

    const vaultContract = getWeb3Contract({
      w3: this.fromToken.chain.w3,
      name: CONTRACT_VELOCORE_VAULT,
      address: this.vaultContractAddress,
    });

    const fromTokenInformation = getPackedTokenInformation({
      index: tokenRef.indexOf(fromTokenPacked),
      amountType: AMOUNT_TYPES.exactly,
      normalizedAmount: normalizedAmount,
    });

    const toTokenInformation = getPackedTokenInformation({
      index: tokenRef.indexOf(toTokenPacked),
      amountType: AMOUNT_TYPES.atMost,
      normalizedAmount: minOutNormalizedAmount,
    });

    const tokenInformationList = [fromTokenInformation, toTokenInformation];

    tokenInformationList.sort(sortStringsHelper);

    const emptyPool = "0x";

    const swapCall = vaultContract.methods.execute(tokenRef, deposit, [
      [poolId, tokenInformationList, emptyPool],
    ]);

    return swapCall;
  }

  protected async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    return await VelocoreSwapAction.getDefaultApproveTransaction({
      account,
      token: this.fromToken,
      spenderAddress: this.vaultContractAddress,
      normalizedAmount,
    });
  }

  protected async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
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
      DEFAULT_SLIPPAGE_PERCENT,
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
      to: this.vaultContractAddress,
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
