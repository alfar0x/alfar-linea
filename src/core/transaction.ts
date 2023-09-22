import Big from "big.js";
import { Transaction } from "web3";

import logger from "../utils/other/logger";

import Account from "./account";
import Chain from "./chain";

const MAX_RETRY_TIMES = 20;

export type CreateTransactionResult = {
  tx: Transaction | null;
  resultMsg: string;
  gasMultiplier?: number;
  retryTimes?: number;
};

export type CreateTransactionFunc = () => Promise<CreateTransactionResult>;

class RunnableTransaction {
  private DEFAULT_GAS_MULTIPLIER = 1.1;
  private DEFAULT_RETRY_TIMES = 0;

  public name: string;
  private chain: Chain;
  private account: Account;
  private createTransaction: CreateTransactionFunc;

  public constructor(params: {
    name: string;
    chain: Chain;
    account: Account;
    createTransaction: CreateTransactionFunc;
  }) {
    const { name, chain, account, createTransaction } = params;

    this.name = name;
    this.chain = chain;
    this.account = account;
    this.createTransaction = createTransaction;
  }

  private increaseGas(tx: Transaction, gasMultiplier: number) {
    if (tx.gas) {
      tx.gas = Big(tx.gas.toString()).times(gasMultiplier).round().toString();
    }

    return tx;
  }

  private async calcTxPriceUsd(tx: Transaction) {
    const gas = String(tx.gas || 0);
    const gasPrice = String(tx.gasPrice || 0);

    const priceEth = Big(gas).times(gasPrice).toString();

    return await this.chain.getNative().readableAmountToUsd(priceEth);
  }

  private async transactionRunner(params: {
    tx: Transaction;
    retryTimes: number;
    gasMultiplier: number;
    maxTxPriceUsd?: number;
  }): Promise<string> {
    const { tx, retryTimes, gasMultiplier, maxTxPriceUsd } = params;

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
      if (retryTimes <= 0) throw error;

      const isTxReverted = (error as Error)?.message?.includes("reverted");
      const isNullableError = (error as Error)?.message?.includes(
        "Cannot use 'in' operator to search for 'originalError' in null",
      );

      if (!isTxReverted && !isNullableError) throw error;

      const nextTx = this.increaseGas(tx, gasMultiplier);

      logger.debug(
        `Retrying to resend tx: ${retryTimes} times | ${tx.gas} gas`,
      );

      return this.transactionRunner({
        tx: nextTx,
        retryTimes: retryTimes - 1,
        gasMultiplier,
        maxTxPriceUsd,
      });
    }
  }

  public async run(params: { maxTxPriceUsd?: number }) {
    const { maxTxPriceUsd } = params;

    const data = await this.createTransaction();

    const {
      tx,
      resultMsg,
      retryTimes = this.DEFAULT_RETRY_TIMES,
      gasMultiplier = this.DEFAULT_GAS_MULTIPLIER,
    } = data;

    if (!tx) return null;

    if (retryTimes && retryTimes >= MAX_RETRY_TIMES) {
      throw new Error(
        `unexpected error. times > maxSendTransactionTimes. ${retryTimes} >= ${MAX_RETRY_TIMES}`,
      );
    }

    const hash = await this.transactionRunner({
      tx,
      maxTxPriceUsd,
      retryTimes,
      gasMultiplier,
    });

    return { hash, resultMsg };
  }

  public toString() {
    return this.name;
  }
}

export default RunnableTransaction;
