import Big from "big.js";
import { ethers } from "ethers";
import { Transaction as Web3Transaction, Web3 } from "web3";
import { z } from "zod";

import { DEFAULT_GAS_MULTIPLIER } from "../constants";
import logger from "../utils/other/logger";
import randomInteger from "../utils/random/randomInteger";
import getShortString from "../utils/string/getShortString";

import Chain from "./chain";
import Token from "./token";

const evmAccountPrivateKeyLength = 66;
const maxSendTransactionTimes = 20;

const evmAccountPrivateKeySchema = z
  .string()
  .length(evmAccountPrivateKeyLength)
  .startsWith("0x");

class Account {
  private privateKey: string;
  public fileIndex: number;
  public address: string;
  public shortAddress: string;
  private _transactionsPerformed: number;

  constructor(params: { privateKey: string; fileIndex: number }) {
    const { privateKey, fileIndex } = params;
    this.fileIndex = fileIndex;
    this.privateKey = this.initializePrivateKey(privateKey);
    this.address = this.initializeAddress();
    this.shortAddress = getShortString(this.address);
    this._transactionsPerformed = 0;
  }

  private initializePrivateKey(privateKey: string) {
    const isPrivateValid = evmAccountPrivateKeySchema.safeParse(privateKey);

    if (isPrivateValid.success) return privateKey;

    const privateShortForm = getShortString(privateKey);

    throw new Error(
      `private key ${privateShortForm} on index ${this.fileIndex} is not valid. Check assets folder`
    );
  }

  private initializeAddress() {
    return ethers.computeAddress(this.privateKey);
  }

  toString() {
    const idx = this.fileIndex + 1;
    const addr = this.shortAddress;
    const txs = this._transactionsPerformed;

    return `[${idx}] ${addr} (txs:${txs})`;
  }

  isEquals(account: Account) {
    return this.fileIndex === account.fileIndex;
  }

  private async signTransaction(w3: Web3, tx: Web3Transaction) {
    return await w3.eth.accounts.signTransaction(tx, this.privateKey);
  }

  private async sendSignedTransaction(w3: Web3, rawTx: string) {
    return await w3.eth.sendSignedTransaction(rawTx);
  }

  async signAndSendTransaction(
    chain: Chain,
    tx: Web3Transaction,
    opts: {
      retry?: { gasMultiplier: number; times: number };
    } = {}
  ): Promise<string> {
    const { retry } = opts;
    const { gasMultiplier = DEFAULT_GAS_MULTIPLIER, times = 0 } = retry || {};

    if (times > maxSendTransactionTimes) {
      throw new Error(
        `Unexpected error. times > maxSendTransactionTimes. ${times} > ${maxSendTransactionTimes}`
      );
    }

    const _tx = Object.assign({}, tx);

    try {
      if (times && _tx.gas) {
        _tx.gas = Big(_tx.gas.toString())
          .times(gasMultiplier)
          .round()
          .toString();
      }

      const signResult = await this.signTransaction(chain.w3, _tx);

      if (!signResult?.rawTransaction) {
        throw new Error("transaction was not generated");
      }

      const sendResult = await this.sendSignedTransaction(
        chain.w3,
        signResult.rawTransaction
      );

      const hash = sendResult.transactionHash.toString();

      logger.debug(`${this} | tx sent: ${chain.getHashLink(hash)}`);

      await chain.waitTxReceipt(hash);

      this.incrementTransactionsPerformed();

      return hash;
    } catch (error) {
      const isTxReverted = (error as Error)?.message?.includes("reverted");
      const isNullableError = (error as Error)?.message?.includes(
        "Cannot use 'in' operator to search for 'originalError' in null"
      );

      if ((isTxReverted || isNullableError) && times) {
        logger.debug(`Retrying to send tx: ${times} times | ${_tx.gas} gas`);
        return this.signAndSendTransaction(chain, _tx, {
          retry: { gasMultiplier, times: times - 1 },
        });
      }

      throw error;
    }
  }

  private incrementTransactionsPerformed() {
    this._transactionsPerformed = this._transactionsPerformed + 1;
  }

  transactionsPerformed() {
    return this._transactionsPerformed;
  }

  async nonce(w3: Web3) {
    return await w3.eth.getTransactionCount(this.address);
  }

  async getRandomNormalizedAmountOfBalance(
    token: Token,
    minPercent: number,
    maxPercent: number
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
      maxNormalizedAmount
    ).toString();

    return randomNormalizedAmount;
  }
}

export default Account;
