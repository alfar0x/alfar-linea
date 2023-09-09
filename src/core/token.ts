import Big from "big.js";
import Web3 from "web3";

import { ERC_20 } from "../abi/types/ERC_20";
import { CONTRACT_ERC_20 } from "../constants";
import getContract from "../utils/web3/getContract";

import Account from "./account";
import Chain from "./chain";
import prices from "./prices";

class Token {
  public name: string;
  public address: string;
  public geskoId: string;
  public chain: Chain;

  public isNative: boolean;
  public isWrappedNative: boolean;
  public contract: ERC_20 | null;

  private readableDecimals: number | null;

  private _decimals: number | null;
  private _symbol: string | null;

  constructor(params: {
    name: string;
    address: string;
    geskoId: string;
    chain: Chain;
    readableDecimals?: number;
    isNative?: boolean;
    isWrappedNative?: boolean;
  }) {
    const {
      name,
      address,
      geskoId,
      chain,
      readableDecimals,
      isNative = false,
      isWrappedNative = false,
    } = params;

    this.name = name;
    this.address = Web3.utils.toChecksumAddress(address);
    this.geskoId = geskoId;
    this.chain = chain;

    this.isNative = isNative;
    this.isWrappedNative = isWrappedNative;
    this.contract = this.initializeContract();

    this.readableDecimals =
      typeof readableDecimals === "number" ? readableDecimals : null;

    this._decimals = null;
    this._symbol = null;
  }

  private initializeContract() {
    if (this.isNative) return null;

    return getContract({
      w3: this.chain.w3,
      name: CONTRACT_ERC_20,
      address: this.address,
    });
  }

  getAddressOrWrappedForNative() {
    return this.isNative ? this.chain.getWrappedNative().address : this.address;
  }

  async decimals() {
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

  async symbol() {
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

  async usdPrice() {
    return await prices.getTokenPrice(this.geskoId);
  }

  async normalizedBalanceOf(address: string) {
    if (this.isNative) {
      const balance = await this.chain.w3.eth.getBalance(address);
      return balance.toString();
    }

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    return await this.contract.methods.balanceOf(address).call();
  }

  async toReadableAmount(
    normalizedAmount: number | string,
    isOriginal = false
  ) {
    const decimals = await this.decimals();
    const readableAmountBig = Big(normalizedAmount).div(Big(10).pow(decimals));
    return this.readableDecimals === null || isOriginal
      ? readableAmountBig.toString()
      : readableAmountBig.round(this.readableDecimals).toString();
  }

  async toNormalizedAmount(readableAmount: number | string) {
    const decimals = await this.decimals();
    return Big(readableAmount).times(Big(10).pow(decimals)).round().toString();
  }

  async readableBalanceOf(address: string) {
    const normalizedBalance = await this.normalizedBalanceOf(address);
    return await this.toReadableAmount(normalizedBalance);
  }

  async readableAmountToUsd(readableAmount: number | string) {
    const usdPrice = await this.usdPrice();
    return Big(readableAmount).times(usdPrice).round(2).toString();
  }

  async normalizedAmountToUsd(normalizedAmount: number | string) {
    const readableAmount = await this.toReadableAmount(normalizedAmount);
    return await this.readableAmountToUsd(readableAmount);
  }

  async usdToReadableAmount(usdAmount: number) {
    const usdPrice = await this.usdPrice();
    return Big(usdAmount).div(usdPrice).toString();
  }

  async usdToNormalizedAmount(usdAmount: number) {
    const readableAmount = await this.usdToReadableAmount(usdAmount);
    return await this.toNormalizedAmount(readableAmount);
  }

  async normalizedAllowance(account: Account, spenderAddress: string) {
    if (this.isNative) return Infinity;

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    const allowanceNormalizedAmount = await this.contract.methods
      .allowance(account.address, spenderAddress)
      .call();

    return allowanceNormalizedAmount;
  }

  async approve(
    account: Account,
    spenderAddress: string,
    normalizedAmount: string | number
  ) {
    if (this.isNative) return null;

    if (!this.contract) {
      throw new Error(`contract of ${this.name} is not defined`);
    }

    const allowanceNormalizedAmount = await this.normalizedAllowance(
      account,
      spenderAddress
    );

    if (Big(allowanceNormalizedAmount).gte(normalizedAmount)) {
      return null;
    }

    const approveFunctionCall = this.contract.methods.approve(
      spenderAddress,
      normalizedAmount
    );

    const nonce = await this.chain.w3.eth.getTransactionCount(account.address);

    const gas = await approveFunctionCall.estimateGas({
      from: account.address,
    });

    const gasPrice = await this.chain.w3.eth.getGasPrice();

    const tx = {
      from: account.address,
      to: this.address,
      data: approveFunctionCall.encodeABI(),
      value: 0,
      nonce,
      gas,
      gasPrice,
    };

    const result = await account.signAndSendTransaction(this.chain, tx);

    return result;
  }

  async getMinOutReadableAmount(
    fromToken: Token,
    fromReadableAmount: string | number,
    slippagePercent: number
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

  async getMinOutNormalizedAmount(
    fromToken: Token,
    fromNormalizedAmount: string | number,
    slippagePercent: number
  ) {
    const fromReadableAmount = await fromToken.toReadableAmount(
      fromNormalizedAmount
    );

    const minOutReadable = await this.getMinOutReadableAmount(
      fromToken,
      fromReadableAmount,
      slippagePercent
    );

    return await this.toNormalizedAmount(minOutReadable);
  }

  isEquals(token: Token) {
    return this.address === token.address && this.name === token.name;
  }

  toString() {
    return `${this.name} [${this.chain}]`;
  }
}

export default Token;
