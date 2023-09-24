import Linea from "../../chain/linea";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Proxy from "../../core/proxy";
import Step from "../../core/step";
import createMessage from "../../utils/other/createMessage";
import getMyIp from "../../utils/other/getMyIp";
import logger from "../../utils/other/logger";
import waitInternetConnection from "../../utils/other/waitInternetConnection";

import TasksRunnerConfig from "./config";
import confirmRun from "./confirmRun";
import initializeAccounts from "./initializeAccounts";
import initializeProxy from "./initializeProxy";
import Task from "./task";
import TaskCreator from "./taskCreator";
import Waiter from "./waiter";

type PrevRun = {
  task: Task | null;
  isSuccess: boolean;
};

class TasksRunner {
  private readonly config: TasksRunnerConfig;
  private readonly chain: Chain;
  private readonly creator: TaskCreator;
  private readonly waiter: Waiter;
  private readonly prevRun: PrevRun;

  private _proxy: Proxy | null;

  public constructor(configFileName: string) {
    this.config = new TasksRunnerConfig({ configFileName });

    const { rpc } = this.config.fixed;

    this.chain = new Linea({ rpc: rpc.linea });

    this._proxy = null;

    this.creator = new TaskCreator({ chain: this.chain, config: this.config });

    this.waiter = new Waiter({ chain: this.chain, config: this.config });

    this.prevRun = { task: null, isSuccess: true };
  }

  private get proxy() {
    if (!this._proxy) {
      throw new Error("unexpected error. proxy is not defined");
    }

    return this._proxy;
  }

  private async changeChainProvider(account: Account) {
    const https = this.proxy.getHttpsTunnelByIndex(account.fileIndex);

    if (!https) return;

    const httpProviderOptions = { providerOptions: { agent: { https } } };

    this.chain.updateHttpProviderOptions({ httpProviderOptions });

    await this.proxy.onProviderChange();
  }

  private async runTransaction(
    step: Step,
    isConnectionChecked = false,
  ): Promise<boolean> {
    const { maxTxPriceUsd } = this.config.dynamic();
    const transaction = step.getNextTransaction();

    if (!transaction) return false;

    try {
      await this.waiter.waitGasLimit();

      const txResult = await transaction.run({ maxTxPriceUsd });

      if (!txResult) return false;

      const { hash, resultMsg, gasPriceUsd } = txResult;

      const message = createMessage(
        transaction,
        "success",
        resultMsg,
        `tx price: $${gasPriceUsd}`,
        this.chain.getHashLink(hash),
      );

      logger.info(createMessage(transaction.account, message));

      await this.waiter.waitTransaction();

      return true;
    } catch (error) {
      const msg = `[${transaction}] ${(error as Error).message}`;

      if (isConnectionChecked) throw new Error(msg);

      const myIp = await getMyIp();

      if (myIp) throw new Error(msg);

      await waitInternetConnection();

      return this.runTransaction(step, true);
    }
  }

  private async runTask() {
    const task = await this.creator.getNextTask();

    if (!task) return false;

    const step = task.getNextStep();

    if (!step || step.isEmpty()) return false;

    const { account } = task;

    const isDifferentTaskNow =
      this.prevRun.task === null || !this.prevRun.task.isEquals(task);

    if (isDifferentTaskNow) {
      await this.changeChainProvider(account);
    }

    if (this.prevRun.isSuccess) await this.waiter.waitStep();

    logger.info(createMessage(account, `step start: ${step}`));

    let isTransactionsSuccess = false;

    while (!step.isEmpty()) {
      const isSuccess = await this.runTransaction(step);

      if (isSuccess) isTransactionsSuccess = true;
    }

    this.prevRun.task = task;

    logger.info(createMessage(account, `step finish`));

    return isTransactionsSuccess;
  }

  public async run() {
    const { files, isAccountsShuffle, proxy } = this.config.fixed;

    const accounts = await initializeAccounts({
      baseFileName: files.privateKeys,
      isShuffle: isAccountsShuffle,
    });

    this._proxy = await initializeProxy({
      proxyConfig: proxy,
      baseFileName: files.proxies,
      accountsLength: accounts.length,
    });

    logger.info(`accounts found: ${accounts.length}`);

    await this.creator.initializedTasks(accounts);

    const factoryInfoStr = this.creator.getFactoryInfoStr();

    logger.info(`Possible routes:\n${factoryInfoStr}`);

    await confirmRun();

    while (!this.creator.isEmpty()) {
      const isSuccess = await this.runTask();

      this.prevRun.isSuccess = isSuccess;
    }
  }
}

export default TasksRunner;
