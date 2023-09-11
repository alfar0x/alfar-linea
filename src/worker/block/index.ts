import Big from "big.js";
import tunnel from "tunnel";
import { HttpProvider } from "web3";

import Linea from "../../chain/linea";
import BlockConfig from "../../config/block";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Proxy from "../../core/proxy";
import Transaction from "../../core/transaction";
import Factory from "../../factory";
import formatIntervalSec from "../../utils/datetime/formatIntervalSec";
import getMyIp from "../../utils/other/getMyIp";
import logger from "../../utils/other/logger";
import sleep from "../../utils/other/sleep";
import waitInternetConnection from "../../utils/other/waitInternetConnection";
import randomChoice from "../../utils/random/randomChoice";
import randomInteger from "../../utils/random/randomInteger";
import waitGasPrice from "../../utils/web3/waitGasPrice";

import confirmRun from "./confirmRun";
import initializeAccounts from "./initializeAccounts";
import initializeFactory from "./initializeFactory";
import initializeProxy from "./initializeProxy";
import Job from "./job";

const WAIT_GAS_SEC = 10 * 60;

class BlockWorker {
  private config: BlockConfig;
  private chain: Chain;
  private proxy: Proxy;
  private jobs: Job[];
  private factory: Factory;
  private accountsLeft: Account[];

  constructor(configFileName: string) {
    this.config = new BlockConfig({ configFileName });

    this.chain = new Linea({ rpc: this.config.fixed.rpc.linea });

    this.accountsLeft = initializeAccounts({
      baseFileName: this.config.fixed.files.privateKeys,
      isShuffle: this.config.fixed.isAccountsShuffle,
    });

    this.proxy = initializeProxy({
      proxyConfig: this.config.fixed.proxy,
      baseFileName: this.config.fixed.files.proxies,
      accountsLength: this.accountsLeft.length,
    });

    this.factory = initializeFactory({
      chain: this.chain,
      activeProviders: this.config.fixed.providers,
      minWorkAmountPercent: this.config.fixed.workingAmountPercent.min,
      maxWorkAmountPercent: this.config.fixed.workingAmountPercent.max,
    });

    this.jobs = [];
  }

  private async updateJobs() {
    const { maxParallelAccounts } = this.config.fixed;

    while (this.jobs.length < maxParallelAccounts) {
      const account = this.accountsLeft.shift();

      if (!account) return;

      const job = await this.createJob(account);

      if (job) this.jobs.push(job);
    }

    const msg = [
      `current jobs ${this.jobs.length}`,
      `accounts left: ${this.accountsLeft.length}`,
    ].join(" | ");

    logger.info(msg);
  }

  private async isBalanceAllowed(account: Account) {
    const native = this.chain.getNative();

    const nativeReadableBalance = await native.readableBalanceOf(
      account.address
    );

    const minEthBalance = this.config.dynamic().minEthBalance;

    const isAllowed = Big(nativeReadableBalance).gte(minEthBalance);

    return { isAllowed, nativeReadableBalance, minEthBalance };
  }

  private async createJob(account: Account): Promise<Job | null> {
    const { transactionsLimit } = this.config.fixed;

    const { isAllowed, nativeReadableBalance, minEthBalance } =
      await this.isBalanceAllowed(account);

    if (!isAllowed) {
      logger.error(
        `${account} | account was filtered due to insufficient ETH balance: ${nativeReadableBalance} < ${minEthBalance}`
      );
      return null;
    }

    const minimumTransactionsLimit = randomInteger(
      transactionsLimit.min,
      transactionsLimit.max
    ).toNumber();

    const steps = await this.factory.getRandomSteps({
      account,
    });

    const job = new Job({ account, minimumTransactionsLimit, steps });

    logger.info(`${account} | job was generated: ${job.toString()}`);

    return job;
  }

  private changeChainProvider(account: Account) {
    const proxy = this.proxy.getTunnelOptionsByIndex(account.fileIndex);

    if (!proxy) return;

    const providerOptions = {
      keepAlive: true,
      timeout: 20000,
      agent: { https: tunnel.httpsOverHttp({ proxy }) },
    };

    const httpProvider = new HttpProvider(this.chain.rpc, { providerOptions });

    this.chain.w3.setProvider(httpProvider);
  }

  private async removeJob(job: Job) {
    this.jobs = this.jobs.filter((jobItem) => !jobItem.isEquals(job));

    const msg = [`${job.account} | account was removed from list`];

    logger.info(msg);

    await this.updateJobs();
  }

  private async waitBeforeStep() {
    const { min, max } = this.config.fixed.delaySec.step;

    const nextStepRunSec = randomInteger(min, max).toNumber();

    const nextStepRunTimeStr = formatIntervalSec(nextStepRunSec);

    logger.info(`next step run ${nextStepRunTimeStr}`);

    await sleep(nextStepRunSec);
  }

  private async waitAfterTransaction() {
    const { min, max } = this.config.fixed.delaySec.transaction;

    const nextTransactionRunSec = randomInteger(min, max).toNumber();

    const nextTransactionRunTimeStr = formatIntervalSec(nextTransactionRunSec);

    logger.info(`next transaction run ${nextTransactionRunTimeStr}`);

    await sleep(nextTransactionRunSec);
  }

  private async runTransaction(
    transaction: Transaction,
    isConnectionChecked = false
  ): Promise<void> {
    try {
      await waitGasPrice(
        this.chain.w3,
        WAIT_GAS_SEC,
        () => this.config.dynamic().maxLineaGwei
      );

      await transaction.run();
    } catch (error) {
      const msg = `[${transaction}] ${(error as Error).message}`;

      if (isConnectionChecked) throw new Error(msg);

      const myIp = await getMyIp();

      if (myIp) throw new Error(msg);

      await waitInternetConnection();

      return this.runTransaction(transaction, true);
    }
  }

  private async runStep(job: Job, isStepSleep = false) {
    const step = job.nextStep();

    if (!step) return;

    let transaction = step.shift();

    if (transaction && isStepSleep) await this.waitBeforeStep();

    logger.info(`${job.account} | step start: ${step}`);

    while (transaction) {
      logger.debug(`${job.account} | transaction start: ${transaction}`);

      await this.runTransaction(transaction);

      logger.debug(`${job.account} | transaction finish: ${transaction}`);

      transaction = step.shift();

      if (transaction) await this.waitAfterTransaction();
    }

    logger.info(`${job.account} | step finish: ${step}`);
  }

  private async runRandomJob(isStepSleep = true) {
    const job = randomChoice(this.jobs);

    const { isAllowed, nativeReadableBalance, minEthBalance } =
      await this.isBalanceAllowed(job.account);

    if (!isAllowed) {
      logger.error(
        `${job.account} | account was filtered due to insufficient ETH balance: ${nativeReadableBalance} < ${minEthBalance}`
      );

      await this.removeJob(job);

      return "JOB_SKIP";
    }

    try {
      this.changeChainProvider(job.account);

      await this.runStep(job, isStepSleep);

      if (!job.isEmpty()) return "STEP_SUCCESS";

      if (job.isMinimumTransactionsLimitReached()) {
        const transactionsPerformed = job.account.transactionsPerformed();

        logger.info(
          `${job.account} | account job success. Transactions performed: ${transactionsPerformed}`
        );

        await this.proxy.postRequest();

        await this.removeJob(job);

        return "JOB_SUCCESS";
      }

      const newSteps = await this.factory.getRandomSteps({
        account: job.account,
      });

      job.setNextSteps(newSteps);

      logger.info(
        `${job.account} | job success. New steps generated: ${job.toString()}`
      );

      return "STEP_SUCCESS_STEPS_ADDED";
    } catch (error) {
      logger.error(`${job.account} | step error: ${(error as Error).message}`);

      if (job.isMinimumTransactionsLimitReached()) {
        await this.proxy.postRequest();

        await this.removeJob(job);

        return "JOB_ERROR";
      } else {
        const newSteps = await this.factory.getRandomSteps({
          account: job.account,
        });

        job.setNextSteps(newSteps);

        return "JOB_ERROR_STEPS_ADDED";
      }
    }
  }

  async run() {
    try {
      await this.updateJobs();

      await confirmRun();

      // should not sleep before first step
      let isBeforeStepSleep = false;

      while (this.jobs.length) {
        const status = await this.runRandomJob(isBeforeStepSleep);

        isBeforeStepSleep = status === "JOB_SKIP" ? false : true;
      }
    } catch (error) {
      logger.error((error as Error).message);
      process.exit();
    }
  }
}

export default BlockWorker;
