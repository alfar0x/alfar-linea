import Big from "big.js";
import { ethers } from "ethers";
import { Transaction as Web3Transaction, Web3 } from "web3";

import formatOrdinals from "../utils/other/formatOrdinals";
import logger from "../utils/other/logger";
import randomInteger from "../utils/random/randomInteger";
import getShortString from "../utils/string/getShortString";
import evmAddressSchema from "../utils/zod/evmAddressSchema";
import evmPrivateKeySchema from "../utils/zod/evmPrivateKeySchema";
import zodErrorPrettify from "../utils/zod/zodErrorPrettify";

import Chain from "./chain";
import Token from "./token";

class Account {
  public readonly fileIndex: number;
  public readonly address: string;
  public readonly name: string;

  private readonly _privateKey?: string;
  private _transactionsPerformed: number;

  public constructor(params: {
    name?: string;
    privateKey?: string;
    address?: string;
    fileIndex: number;
  }) {
    const { name, privateKey, address, fileIndex } = params;
    this.fileIndex = fileIndex;

    if (privateKey) {
      this._privateKey = this.initializePrivateKey(privateKey);
      this.address = ethers.computeAddress(privateKey);
    } else if (address) {
      this.address = this.initializeAddressFromGiven(address);
    } else {
      throw new Error("Either private key or address must be provided.");
    }
    this.name = name || getShortString(this.address);
    this._transactionsPerformed = 0;
  }

  private initializeAddressFromGiven(address: string) {
    const addressParsed = evmAddressSchema.safeParse(address);

    if (addressParsed.success) return address;

    const indexOrd = formatOrdinals(this.fileIndex + 1);

    const errorMessage = zodErrorPrettify(addressParsed.error.issues);

    throw new Error(
      `${indexOrd} address is not valid. Details: ${errorMessage}`,
    );
  }

  private initializePrivateKey(privateKey: string) {
    const privateKeyParsed = evmPrivateKeySchema.safeParse(privateKey);

    if (privateKeyParsed.success) return privateKey;

    const indexOrd = formatOrdinals(this.fileIndex + 1);

    const privateShortForm = getShortString(privateKey);

    const errorMessage = zodErrorPrettify(privateKeyParsed.error.issues);

    throw new Error(
      `${indexOrd} private key ${privateShortForm} is not valid. Details: ${errorMessage}`,
    );
  }

  public toString() {
    return this.name;
  }

  public isEquals(account: Account) {
    return this.fileIndex === account.fileIndex;
  }

  private get privateKey() {
    if (!this._privateKey) {
      throw new Error(
        "This account is read-only. Cannot perform this operation.",
      );
    }

    return this._privateKey;
  }

  private async signTransaction(w3: Web3, tx: Web3Transaction) {
    return await w3.eth.accounts.signTransaction(tx, this.privateKey);
  }

  private static async sendSignedTransaction(w3: Web3, rawTx: string) {
    return await w3.eth.sendSignedTransaction(rawTx);
  }

  public async signAndSendTransaction(
    chain: Chain,
    tx: Web3Transaction,
  ): Promise<string> {
    const signResult = await this.signTransaction(chain.w3, tx);

    if (!signResult.rawTransaction) {
      throw new Error("transaction was not generated in blockchain");
    }

    const sendResult = await Account.sendSignedTransaction(
      chain.w3,
      signResult.rawTransaction,
    );

    const hash = sendResult.transactionHash.toString();

    logger.debug(`${this} | tx sent: ${chain.getHashLink(hash)}`);

    await chain.waitTxReceipt(hash);

    this.incrementTransactionsPerformed();

    return hash;
  }

  private incrementTransactionsPerformed() {
    this._transactionsPerformed = this._transactionsPerformed + 1;
  }

  public get transactionsPerformed() {
    return this._transactionsPerformed;
  }

  public async nonce(w3: Web3) {
    return await w3.eth.getTransactionCount(this.address);
  }

  public async getRandomNormalizedAmountOfBalance(
    token: Token,
    minPercent: number,
    maxPercent: number,
  ) {
    const accountBalance = await token.normalizedBalanceOf(this.address);

    const minMultiplier = Big(minPercent).div(100);
    const maxMultiplier = Big(maxPercent).div(100);

    const minNormalizedAmount = Big(accountBalance)
      .times(minMultiplier)
      .round()
      .toString();

    const maxNormalizedAmount = Big(accountBalance)
      .times(maxMultiplier)
      .round()
      .toString();

    const randomNormalizedAmount = randomInteger(
      minNormalizedAmount,
      maxNormalizedAmount,
    ).toString();

    return randomNormalizedAmount;
  }

  public async isBalanceGteReadable(params: {
    token: Token;
    minReadableAmount: number;
  }) {
    const { token, minReadableAmount } = params;

    const normalizedAmount = await token.toNormalizedAmount(minReadableAmount);

    const normalizedBalance = await token.normalizedBalanceOf(this.address);

    const isAllowed = Big(normalizedBalance).gte(normalizedAmount);

    if (isAllowed) return { isAllowed };

    const readableBalance = await token.toReadableAmount(normalizedBalance);

    return { isAllowed, readableBalance };
  }
}

export default Account;
