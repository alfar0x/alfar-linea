import Big from "big.js";
import { Transaction } from "web3";

import { DEFAULT_GAS_MULTIPLIER } from "../constants";
import logger from "../utils/other/logger";

import Account from "./account";
import Chain from "./chain";

const maxSendTransactionTimes = 20;

type TransactionResult = { tx: Transaction | null; resultMsg: string };
export type CreateTransactionFunc = () => Promise<TransactionResult>;

class RunnableTransaction {
  public name: string;
  public chain: Chain;
  public account: Account;
  public createTransaction: CreateTransactionFunc;
  public gasMultiplier: number;
  public retryTimes: number;

  constructor(params: {
    name: string;
    chain: Chain;
    account: Account;
    createTransaction: CreateTransactionFunc;
    gasMultiplier?: number;
    retryTimes?: number;
  }) {
    const {
      name,
      chain,
      account,
      createTransaction,
      gasMultiplier,
      retryTimes,
    } = params;

    if (retryTimes && retryTimes >= maxSendTransactionTimes) {
      throw new Error(
        `Unexpected error. times > maxSendTransactionTimes. ${retryTimes} >= ${maxSendTransactionTimes}`,
      );
    }

    this.name = name;
    this.chain = chain;
    this.account = account;
    this.createTransaction = createTransaction;
    this.gasMultiplier = gasMultiplier || DEFAULT_GAS_MULTIPLIER;
    this.retryTimes = retryTimes || 0;
  }

  private increaseGas(tx: Transaction) {
    if (this.retryTimes && tx.gas) {
      tx.gas = Big(tx.gas.toString())
        .times(this.gasMultiplier)
        .round()
        .toString();

      this.retryTimes -= 1;
    }

    return tx;
  }

  private async calcTxPriceUsd(tx: Transaction) {
    const gas = String(tx.gas || 0);
    const gasPrice = String(tx.gasPrice || 0);

    const priceEth = Big(gas).times(gasPrice).toString();

    return await this.chain.getNative().readableAmountToUsd(priceEth);
  }

  private getSuccessMessage(hash: string, resultMsg: string) {
    const msg = [
      String(this.account),
      this.name,
      `${resultMsg} success`,
      this.chain.getHashLink(hash),
    ].join(" | ");

    return msg;
  }

  private async transactionRunner(params: {
    tx: Transaction;
    maxTxPriceUsd?: number;
  }): Promise<string> {
    const { tx, maxTxPriceUsd } = params;

    if (maxTxPriceUsd) {
      const gasPriceUsd = await this.calcTxPriceUsd(tx);
      if (Big(gasPriceUsd).gt(maxTxPriceUsd)) {
        throw new Error(
          `Tx price is greater than max value: ${gasPriceUsd} > ${maxTxPriceUsd}`,
        );
      }
    }

    try {
      const hash = await this.account.signAndSendTransaction(this.chain, tx);

      return hash;
    } catch (error) {
      const isTxReverted = (error as Error)?.message?.includes("reverted");
      const isNullableError = (error as Error)?.message?.includes(
        "Cannot use 'in' operator to search for 'originalError' in null",
      );

      if (!this.retryTimes) throw error;

      if (!isTxReverted && !isNullableError) throw error;

      const nextTx = this.increaseGas(tx);

      logger.debug(
        `Retrying to resend tx: ${this.retryTimes} times | ${tx.gas} gas`,
      );

      return this.transactionRunner({ tx: nextTx, maxTxPriceUsd });
    }
  }

  async run(params: { maxTxPriceUsd?: number }) {
    const { maxTxPriceUsd } = params;

    const data = await this.createTransaction();

    const { tx, resultMsg } = data;

    if (!tx) return null;

    const hash = await this.transactionRunner({ tx, maxTxPriceUsd });

    logger.info(this.getSuccessMessage(hash, resultMsg));

    return hash;
  }

  toString() {
    return this.name;
  }
}

export default RunnableTransaction;
