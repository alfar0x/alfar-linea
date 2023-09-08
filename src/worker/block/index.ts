import { HttpProvider } from "web3";

import Account from "../../core/account";
import Block from "../../core/block";
import BlockConfig from "../../config/block";
import Job from "./job";
import Proxy from "../../core/proxy";
import Transaction from "../../core/transaction";
import formatIntervalSec from "../../utils/formatIntervalSec";
import getMyIp from "../../utils/getMyIp";
import isFileAvailable from "../../utils/isFileAvailable";
import logger from "../../common/logger";
import randomShuffle from "../../utils/randomShuffle";
import readFileSyncByLine from "../../utils/readFileSyncByLine";
import sleep from "../../common/sleep";
import waitGasPrice from "../../utils/waitGasPrice";
import waitInternetConnection from "../../utils/waitInternetConnection";
import Chain from "../../core/chain";
import tunnel from "tunnel";
import Big from "big.js";
import randomInteger from "../../utils/randomInteger";
import Linea from "../../chain/linea";
import availableBlocks from "../../config/block/availableBlocks";
import randomChoices from "../../utils/randomChoices";
import initializeBlocks from "./initializeBlocks";
import initializeProxy from "./initializeProxy";
import confirmRun from "./confirmRun";

const waitGasSec = 10 * 60;

type BlockName = (typeof availableBlocks)[number];

class BlockWorker {
  private sleepAfterPostRequestSec = 30;

  private config: BlockConfig;
  private chain: Chain;
  private proxy: Proxy;
  private availableBlocks: Block[];
  private jobs: Job[];

  constructor(configFileName: string) {
    this.config = new BlockConfig({ configFileName });

    this.chain = new Linea({ rpc: this.config.fixed.rpc.linea });

    this.proxy = initializeProxy({
      proxyConfig: this.config.fixed.proxy,
      baseFileName: this.config.fixed.files.proxies,
    });

    this.availableBlocks = initializeBlocks({
      chain: this.chain,
      minWorkAmountPercent: this.config.fixed.workingAmountPercent.min,
      maxWorkAmountPercent: this.config.fixed.workingAmountPercent.max,
    });

    this.jobs = [];
  }

  private async shouldAccountBeFiltered(account: Account) {
    const native = this.chain.getNative();

    const nativeReadableBalance = await native.readableBalanceOf(
      account.address
    );

    const minEthBalance = this.config.dynamic().minEthBalance;

    const isAllowedAccount = Big(nativeReadableBalance).gte(minEthBalance);

    return { isAllowedAccount, nativeReadableBalance };
  }

  private async filterInitialAccounts(accounts: Account[]) {
    const filteredAccounts: Account[] = [];
    const allowedAccounts: Account[] = [];

    for (const account of accounts) {
      const { isAllowedAccount } = await this.shouldAccountBeFiltered(account);

      if (isAllowedAccount) {
        allowedAccounts.push(account);
      } else {
        filteredAccounts.push(account);
      }
    }

    const filteredAccountsMsg = [
      `filtered ${filteredAccounts.length} accounts:`,
      ...filteredAccounts.map(String),
    ].join("\n");

    logger.info(filteredAccountsMsg);

    return allowedAccounts;
  }

  private async initializeJobs() {
    const {
      files,
      blocks: blockNames,
      blocksCount,
      isBlockDuplicates,
      isShuffle,
    } = this.config.fixed;

    const fullFileName = `./assets/${files.privateKeys}`;

    if (!isFileAvailable(fullFileName)) {
      throw new Error(
        `private keys file name ${files.privateKeys} is not valid`
      );
    }

    const privateKeys = readFileSyncByLine(fullFileName);
    const allAccounts = privateKeys.map(
      (privateKey, fileIndex) => new Account({ privateKey, fileIndex })
    );

    const accounts = await this.filterInitialAccounts(allAccounts);

    const blocks = this.availableBlocks.filter((block) =>
      blockNames.includes(block.name as BlockName)
    );

    const isServerRandom = this.proxy.isServerRandom();
    const proxyCount = this.proxy.count();

    if (isServerRandom && accounts.length !== proxyCount) {
      throw new Error(
        `number of proxies (${proxyCount}) must be equal to the number accounts ${accounts.length} if serverIsRandom === false`
      );
    }

    const jobs = accounts.map((account) => {
      const randomBlocksCount = randomInteger(
        blocksCount.min,
        blocksCount.max
      ).toNumber();

      const randomBlocks = randomChoices(
        blocks,
        randomBlocksCount,
        isBlockDuplicates
      );

      return new Job(account, randomBlocks);
    });

    const sortedJobs = isShuffle ? randomShuffle(jobs) : jobs;

    const generatedMsg = [
      `generated ${sortedJobs.length} jobs:`,
      ...sortedJobs.map(String),
    ].join("\n");

    logger.info(generatedMsg);

    return sortedJobs;
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

  private getRandomJob() {
    const { maxParallelAccounts } = this.config.fixed;
    const maxIndexBaseOnOne = Math.min(this.jobs.length, maxParallelAccounts);
    const maxIndex = maxIndexBaseOnOne - 1;
    const randomIndex = randomInteger(0, maxIndex).toNumber();
    return this.jobs[randomIndex];
  }

  private removeJob(job: Job) {
    this.jobs = this.jobs.filter((jobItem) => !jobItem.isEquals(job));

    logger.info(`jobs left: ${this.jobs.length}`);
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
        waitGasSec,
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
    const job = this.getRandomJob();

    const { isAllowedAccount, nativeReadableBalance } =
      await this.shouldAccountBeFiltered(job.account);

    if (!isAllowedAccount) {
      logger.error(
        `${job.account} | balance is less that min balance for work: ${nativeReadableBalance}`
      );
      this.removeJob(job);
      return "JOB_SKIP";
    }

    try {
      this.changeChainProvider(job.account);

      await this.runStep(job, isStepSleep);

      if (job.isEmpty()) {
        logger.info(`${job.account} | jobs finish: success`);

        this.removeJob(job);

        const isPostRequestDone = await this.proxy.postRequest();

        if (isPostRequestDone) {
          const sleepUntilStr = formatIntervalSec(
            this.sleepAfterPostRequestSec
          );
          logger.info(`sleeping after account job done until ${sleepUntilStr}`);
          await sleep(this.sleepAfterPostRequestSec);
        }

        return "JOB_SUCCESS";
      }
    } catch (error) {
      logger.error(`${job.account} | step error: ${(error as Error).message}`);
      logger.info(`${job.account} | getting next block`);

      const isSet = job.setNextCurrentSteps();

      if (!isSet) this.removeJob(job);

      return "STEP_ERROR";
    }

    return "STEP_SUCCESS";
  }

  private isEmpty() {
    return !this.jobs.length;
  }

  async run() {
    try {
      this.jobs = await this.initializeJobs();

      await confirmRun();

      // should not sleep before first step
      let isBeforeStepSleep = false;

      while (!this.isEmpty()) {
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
