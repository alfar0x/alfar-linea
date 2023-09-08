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
import prompts from "prompts";
import randomInteger from "../../utils/randomInteger";
import Linea from "../../chain/linea";
import SyncSwapEthUsdcSwap from "../../block/syncSwapSwap/syncSwapEthUsdcSwap";
import SyncSwapEthWbtcSwap from "../../block/syncSwapSwap/syncSwapEthWbtcSwap";
import DmailSendMail from "../../block/dmail/dmailSendMail";
import VelocoreEthUsdcSwap from "../../block/velocoreSwap/velocoreEthUsdcSwap";
import VelocoreEthCebusdSwap from "../../block/velocoreSwap/velocoreEthCebusdSwap";
import SyncSwapEthCebusdSwap from "../../block/syncSwapSwap/syncSwapEthCebusdSwap";
import availableBlocks from "../../config/block/availableBlocks";
import randomChoices from "../../utils/randomChoices";

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
    this.config = new BlockConfig(configFileName);

    this.chain = new Linea({ rpc: this.config.fixed.rpc.linea });

    this.proxy = this.initializeProxy();
    this.availableBlocks = this.initializeBlocks();
    this.jobs = [];
  }

  private initializeProxy() {
    const proxyConfig = this.config.fixed.proxy;
    const proxyType = proxyConfig.type;
    const baseFileName = this.config.fixed.files.proxies;
    const fileName = `./assets/${baseFileName}`;

    if (proxyType !== "none" && !isFileAvailable(fileName)) {
      throw new Error(`proxy file name ${fileName} is not valid`);
    }

    switch (proxyType) {
      // case "mobile": {
      //   return new Proxy({
      //     type: "mobile",
      //     fileName,
      //     ipChangeUrl: proxyConfig.mobileIpChangeUrl,
      //   });
      // }
      // case "server": {
      //   return new Proxy({
      //     type: "server",
      //     fileName,
      //     isRandom: proxyConfig.serverIsRandom,
      //   });
      // }
      case "none": {
        return new Proxy({ type: "none", fileName });
      }
      default: {
        throw new Error(`${proxyType} proxy type not supported in block mode`);
      }
    }
  }

  private initializeBlocks() {
    return [
      new SyncSwapEthUsdcSwap(
        this.chain,
        this.config.fixed.workingAmountPercent.min,
        this.config.fixed.workingAmountPercent.max
      ),
      new SyncSwapEthWbtcSwap(
        this.chain,
        this.config.fixed.workingAmountPercent.min,
        this.config.fixed.workingAmountPercent.max
      ),
      new SyncSwapEthCebusdSwap(
        this.chain,
        this.config.fixed.workingAmountPercent.min,
        this.config.fixed.workingAmountPercent.max
      ),
      new VelocoreEthUsdcSwap(
        this.chain,
        this.config.fixed.workingAmountPercent.min,
        this.config.fixed.workingAmountPercent.max
      ),
      new VelocoreEthCebusdSwap(
        this.chain,
        this.config.fixed.workingAmountPercent.min,
        this.config.fixed.workingAmountPercent.max
      ),
      new DmailSendMail({ chain: this.chain }),
    ];
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
    const fileName = this.config.fixed.files.privateKeys;
    const fullFileName = `./assets/${fileName}`;

    if (!isFileAvailable(fullFileName)) {
      throw new Error(`private keys file name ${fileName} is not valid`);
    }

    const privateKeys = readFileSyncByLine(fullFileName);
    const allAccounts = privateKeys.map(
      (privateKey, fileIndex) => new Account({ privateKey, fileIndex })
    );

    const accounts = await this.filterInitialAccounts(allAccounts);

    const blockNames = this.config.fixed.blocks;
    const minBlocksCount = this.config.fixed.blocksCount.min;
    const maxBlocksCount = this.config.fixed.blocksCount.max;
    const isBlockDuplicates = this.config.fixed.isBlockDuplicates;

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
        minBlocksCount,
        maxBlocksCount
      ).toNumber();

      const randomBlocks = randomChoices(
        blocks,
        randomBlocksCount,
        isBlockDuplicates
      );

      return new Job(account, randomBlocks);
    });

    const sortedJobs = this.config.fixed.isShuffle ? randomShuffle(jobs) : jobs;

    const jobsCount = sortedJobs.length;

    const generatedMsg = [
      `generated ${jobsCount} jobs:`,
      ...sortedJobs.map(String),
    ].join("\n");

    logger.info(generatedMsg);

    return sortedJobs;
  }

  private getRandomJob() {
    const { maxParallelAccounts } = this.config.fixed;
    const maxIndexBaseOnOne = Math.min(this.jobs.length, maxParallelAccounts);
    const maxIndex = maxIndexBaseOnOne - 1;
    const randomIndex = randomInteger(0, maxIndex).toNumber();
    return this.jobs[randomIndex];
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
      return;
    }

    try {
      await this.runStep(job, isStepSleep);

      this.changeChainProvider(job.account);

      if (job.isEmpty()) this.onJobSuccess(job);
    } catch (error) {
      this.onStepError(job, error as Error);
    }
  }

  private async waitBeforeStep() {
    const minDelaySec = this.config.fixed.delaySec.step.min;
    const maxDelaySec = this.config.fixed.delaySec.step.max;
    const nextStepRunSec = randomInteger(minDelaySec, maxDelaySec).toNumber();

    const nextStepRunTimeStr = formatIntervalSec(nextStepRunSec);

    logger.info(`next step run ${nextStepRunTimeStr}`);

    await sleep(nextStepRunSec);
  }

  private async waitAfterTransaction() {
    const nextTransactionRunSec = randomInteger(
      this.config.fixed.delaySec.transaction.min,
      this.config.fixed.delaySec.transaction.max
    ).toNumber();

    const nextTransactionRunTimeStr = formatIntervalSec(nextTransactionRunSec);

    logger.info(`next transaction run ${nextTransactionRunTimeStr}`);

    await sleep(nextTransactionRunSec);
  }

  private async runTransaction(
    transaction: Transaction,
    job: Job,
    isConnectionChecked = false
  ): Promise<void> {
    try {
      await waitGasPrice(
        this.chain.w3,
        waitGasSec,
        () => this.config.dynamic().maxLineaGwei
      );

      logger.debug(`${job.account} | transaction start: ${transaction}`);

      await transaction.run();

      logger.debug(`${job.account} | transaction finish: ${transaction}`);
    } catch (error) {
      const msg = `[${transaction}] ${(error as Error).message}`;

      if (isConnectionChecked) throw new Error(msg);

      const myIp = await getMyIp();

      if (myIp) throw new Error(msg);

      await waitInternetConnection();

      return this.runTransaction(transaction, job, true);
    }
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

  private async runStep(job: Job, isStepSleep = false) {
    const step = job.nextStep();

    if (!step) return;

    let transaction = step.shift();

    if (transaction && isStepSleep) await this.waitBeforeStep();

    logger.info(`${job.account} | step start: ${step}`);

    while (transaction) {
      await this.runTransaction(transaction, job);

      transaction = step.shift();

      if (transaction) await this.waitAfterTransaction();
    }

    logger.info(`${job.account} | step finish: ${step}`);
  }

  private removeJob(job: Job) {
    this.jobs = this.jobs.filter((jobItem) => !jobItem.isEquals(job));

    logger.info(`jobs left: ${this.jobs.length}`);
  }

  private async onJobSuccess(job: Job) {
    logger.info(`${job.account} | jobs finish: success`);

    this.removeJob(job);

    const isPostRequestDone = await this.proxy.postRequest();

    if (isPostRequestDone) {
      const sleepUntilStr = formatIntervalSec(this.sleepAfterPostRequestSec);
      logger.info(`sleeping after account job done until ${sleepUntilStr}`);
      await sleep(this.sleepAfterPostRequestSec);
    }
  }

  private onStepError(job: Job, error: Error) {
    logger.error(`${job.account} | step error: ${error.message}`);
    logger.info(`${job.account} | getting next block`);

    const nextCurrentStepsCount = job.setNextCurrentSteps();

    if (!nextCurrentStepsCount) this.removeJob(job);
  }

  private async confirmRun() {
    const res = await prompts({
      type: "confirm",
      name: "value",
      message: "Can you confirm?",
      initial: true,
    });

    if (!res.value) {
      throw new Error(`run was not confirmed`);
    }
  }

  private isEmpty() {
    return !this.jobs.length;
  }

  async run() {
    try {
      this.jobs = await this.initializeJobs();

      await this.confirmRun();

      let isFirstIteration = true;

      while (!this.isEmpty()) {
        await this.runRandomJob(!isFirstIteration);

        if (isFirstIteration) isFirstIteration = false;
      }
    } catch (error) {
      logger.error((error as Error).message);
      process.exit();
    }
  }
}

export default BlockWorker;
