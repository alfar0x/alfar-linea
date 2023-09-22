import Big from "big.js";
import Web3, { Transaction } from "web3";

import { CONTRACT_ERC20 } from "../abi/constants/contracts";
import getWeb3Contract from "../abi/methods/getWeb3Contract";
import { Erc20 } from "../abi/types/web3-v1/Erc20";
import { Amount, TokenType } from "../types";

import Account from "./account";
import Chain from "./chain";
import Prices from "./prices";

class Token {
  public readonly name: string;
  public readonly address: string;
  public readonly geskoId: string;
  public readonly chain: Chain;
  public readonly type: TokenType;
  public readonly contract: Erc20 | null;
  public readonly readableDecimals: number | null;

  private _decimals: number | null;
  private _symbol: string | null;

  public constructor(params: {
    name: string;
    address: string;
    geskoId: string;
    chain: Chain;
    readableDecimals?: number;
    type?: TokenType;
  }) {
    const {
      name,
      address,
      geskoId,
      chain,
      readableDecimals,
      type = "ERC20",
    } = params;

    this.name = name;
    this.address = Web3.utils.toChecksumAddress(address);
    this.geskoId = geskoId;
    this.chain = chain;
    this.type = type;

    this.contract = this.initializeContract();

    this.readableDecimals =
      typeof readableDecimals === "number" ? readableDecimals : null;

    this._decimals = null;
    this._symbol = null;
  }

  public get isNative() {
    return this.type === "NATIVE";
  }
  public get isWrappedNative() {
    return this.type === "WRAPPED_NATIVE";
  }

  private initializeContract() {
    if (this.isNative) return null;

    return getWeb3Contract({
      w3: this.chain.w3,
      name: CONTRACT_ERC20,
      address: this.address,
    });
  }

  public getAddressOrWrappedForNative() {
    return this.isNative ? this.chain.getWrappedNative().address : this.address;
  }

  public async decimals() {
    if (this.isNative) {
      if (!this._decimals) this._decimals = 18;

      return this._decimals;
    }

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    if (this._decimals === null) {
      const decimalsStr = await this.contract.methods.decimals().call();

      this._decimals = Big(decimalsStr).toNumber();
    }

    return this._decimals;
  }

  public async symbol() {
    if (this.isNative) {
      if (!this._symbol) this._symbol = "eth";

      return this._symbol;
    }

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    if (this._symbol === null) {
      this._symbol = await this.contract.methods.symbol().call();
    }

    return this._symbol;
  }

  public async usdPrice() {
    return await Prices.instance.getTokenPrice(this.geskoId);
  }

  public async normalizedBalanceOf(address: string) {
    if (this.isNative) {
      const balance = await this.chain.w3.eth.getBalance(address);
      return balance.toString();
    }

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    return await this.contract.methods.balanceOf(address).call();
  }

  public async toReadableAmount(normalizedAmount: Amount, isOriginal = false) {
    const decimals = await this.decimals();
    const readableAmountBig = Big(normalizedAmount).div(Big(10).pow(decimals));
    return this.readableDecimals === null || isOriginal
      ? readableAmountBig.toString()
      : readableAmountBig.round(this.readableDecimals).toString();
  }

  public async toNormalizedAmount(readableAmount: Amount) {
    const decimals = await this.decimals();
    return Big(readableAmount).times(Big(10).pow(decimals)).round().toString();
  }

  public async readableBalanceOf(address: string) {
    const normalizedBalance = await this.normalizedBalanceOf(address);
    return await this.toReadableAmount(normalizedBalance);
  }

  public async readableAmountToUsd(readableAmount: Amount) {
    const usdPrice = await this.usdPrice();
    return Big(readableAmount).times(usdPrice).round(2).toString();
  }

  public async normalizedAmountToUsd(normalizedAmount: Amount) {
    const readableAmount = await this.toReadableAmount(normalizedAmount);
    return await this.readableAmountToUsd(readableAmount);
  }

  public async usdToReadableAmount(usdAmount: number) {
    const usdPrice = await this.usdPrice();
    return Big(usdAmount).div(usdPrice).toString();
  }

  public async usdToNormalizedAmount(usdAmount: number) {
    const readableAmount = await this.usdToReadableAmount(usdAmount);
    return await this.toNormalizedAmount(readableAmount);
  }

  public async normalizedAllowance(account: Account, spenderAddress: string) {
    if (this.isNative) return Infinity;

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    const allowanceNormalizedAmount = await this.contract.methods
      .allowance(account.address, spenderAddress)
      .call();

    return allowanceNormalizedAmount;
  }

  public async getApproveTransaction(params: {
    account: Account;
    spenderAddress: string;
    normalizedAmount: Amount;
  }) {
    const { account, spenderAddress, normalizedAmount } = params;

    if (this.isNative) return null;

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    const allowanceNormalizedAmount = await this.normalizedAllowance(
      account,
      spenderAddress,
    );

    if (Big(allowanceNormalizedAmount).gte(normalizedAmount)) {
      return null;
    }

    const approveFunctionCall = this.contract.methods.approve(
      spenderAddress,
      normalizedAmount,
    );

    const nonce = await this.chain.w3.eth.getTransactionCount(account.address);

    const gas = await approveFunctionCall.estimateGas({
      from: account.address,
    });

    const gasPrice = await this.chain.w3.eth.getGasPrice();

    const tx: Transaction = {
      from: account.address,
      to: this.address,
      data: approveFunctionCall.encodeABI(),
      value: 0,
      nonce,
      gas,
      gasPrice,
    };

    return tx;
  }

  public async getMinOutReadableAmount(
    fromToken: Token,
    fromReadableAmount: Amount,
    slippagePercent: number,
  ) {
    const fromTokenPrice = await fromToken.usdPrice();
    const toTokenPrice = await this.usdPrice();

    const slippageDivider = Big(100).minus(slippagePercent).div(100);

    return Big(fromReadableAmount)
      .times(fromTokenPrice)
      .div(toTokenPrice)
      .times(slippageDivider)
      .toString();
  }

  public async getMinOutNormalizedAmount(
    fromToken: Token,
    fromNormalizedAmount: Amount,
    slippagePercent: number,
  ) {
    const fromReadableAmount =
      await fromToken.toReadableAmount(fromNormalizedAmount);

    const minOutReadable = await this.getMinOutReadableAmount(
      fromToken,
      fromReadableAmount,
      slippagePercent,
    );

    return await this.toNormalizedAmount(minOutReadable);
  }

  public isEquals(token: Token) {
    return this.address === token.address && this.name === token.name;
  }

  public toString() {
    return this.name;
  }
}

export default Token;
