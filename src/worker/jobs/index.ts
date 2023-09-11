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

class JobWorker {
  private config: BlockConfig;
  private chain: Chain;
  private proxy: Proxy;
  private jobs: Job[];
  private factory: Factory;
  private accountsLeft: Account[];

  constructor(configFileName: string) {
    this.config = new BlockConfig({ configFileName });

    const {
      rpc,
      files,
      isAccountsShuffle,
      proxy,
      providers,
      workingAmountPercent,
    } = this.config.fixed;

    this.chain = new Linea({ rpc: rpc.linea });

    this.accountsLeft = initializeAccounts({
      baseFileName: files.privateKeys,
      isShuffle: isAccountsShuffle,
    });

    this.proxy = initializeProxy({
      proxyConfig: proxy,
      baseFileName: files.proxies,
      accountsLength: this.accountsLeft.length,
    });

    this.factory = initializeFactory({
      chain: this.chain,
      activeProviders: providers,
      minWorkAmountPercent: workingAmountPercent.min,
      maxWorkAmountPercent: workingAmountPercent.max,
    });

    this.jobs = [];
  }

  private msg(texts: string[]) {
    return texts.join(" | ");
  }

  private async updateJobs() {
    const { maxParallelAccounts } = this.config.fixed;

    while (this.jobs.length < maxParallelAccounts) {
      const account = this.accountsLeft.shift();

      if (!account) return;

      const job = await this.createJob(account);

      if (job) this.jobs.push(job);
    }

    logger.info(
      this.msg([
        `current jobs ${this.jobs.length}`,
        `accounts left: ${this.accountsLeft.length}`,
      ])
    );
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
        this.msg([
          String(account),
          `account was filtered due to insufficient ETH balance`,
          `${nativeReadableBalance} < ${minEthBalance}`,
        ])
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

    logger.info(
      this.msg([String(account), `job was generated: ${job.toString()}`])
    );

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

    logger.info(this.msg([`${job.account}`, `account was removed from list`]));

    await this.updateJobs();
  }

  private async waitBeforeStep() {
    const { min, max } = this.config.fixed.delaySec.step;

    const nextStepRunSec = randomInteger(min, max).toNumber();

    const nextStepRunTimeStr = formatIntervalSec(nextStepRunSec);

    logger.info(this.msg([`next step run ${nextStepRunTimeStr}`]));

    await sleep(nextStepRunSec);
  }

  private async waitAfterTransaction() {
    const { min, max } = this.config.fixed.delaySec.transaction;

    const nextTransactionRunSec = randomInteger(min, max).toNumber();

    const nextTransactionRunTimeStr = formatIntervalSec(nextTransactionRunSec);

    logger.info(
      this.msg([`next transaction run ${nextTransactionRunTimeStr}`])
    );

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

    logger.info(this.msg([String(job.account), `step start: ${step}`]));

    while (transaction) {
      await this.runTransaction(transaction);

      transaction = step.shift();

      if (transaction) await this.waitAfterTransaction();
    }

    logger.info(this.msg([String(job.account), `step finish: ${step}`]));
  }

  private async runRandomJob(isStepSleep = true) {
    const job = randomChoice(this.jobs);

    const { isAllowed, nativeReadableBalance, minEthBalance } =
      await this.isBalanceAllowed(job.account);

    if (!isAllowed) {
      logger.error(
        this.msg([
          String(job.account),
          `account was filtered due to insufficient ETH balance`,
          `${nativeReadableBalance} < ${minEthBalance}`,
        ])
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
          this.msg([
            String(job.account),
            `account job success`,
            `transactions performed: ${transactionsPerformed}`,
          ])
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
        this.msg([
          String(job.account),
          `job success`,
          `new steps generated: ${job.toString()}`,
        ])
      );

      return "STEP_SUCCESS_STEPS_ADDED";
    } catch (error) {
      logger.error(
        this.msg([
          String(job.account),
          `step error: ${(error as Error).message}`,
        ])
      );

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

export default JobWorker;
