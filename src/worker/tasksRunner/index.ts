import readline from "readline";

import Linea from "../../chain/linea";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Proxy from "../../core/proxy";
import Step from "../../core/step";
import createMessage from "../../utils/other/createMessage";
import getMyIp from "../../utils/other/getMyIp";
import logger from "../../utils/other/logger";
import sleep from "../../utils/other/sleep";
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
  isTransactionsRun: boolean;
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

    this.prevRun = { task: null, isTransactionsRun: false };
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
    const { maxTxFeeUsd } = this.config.dynamic();
    const transaction = step.getNextTransaction();

    if (!transaction) return false;

    try {
      await this.waiter.waitGasLimit();

      // worker test
      // const txResult = { hash: "", resultMsg: "msg", gasPriceUsd: 0 };

      const txResult = await transaction.run({ maxTxFeeUsd });

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

    if (!step || step.isEmpty()) {
      await this.creator.updateTask(task);
      return false;
    }

    const { account } = task;

    const isDifferentTaskNow =
      this.prevRun.task === null || !this.prevRun.task.isEquals(task);

    if (isDifferentTaskNow) {
      await this.changeChainProvider(account);
    }

    if (this.prevRun.isTransactionsRun) await this.waiter.waitStep();

    logger.info(createMessage(account, `step start: ${step}`));

    let isTransactionsRun = false;

    while (!step.isEmpty()) {
      try {
        const isRun = await this.runTransaction(step);
        if (isRun) {
          isTransactionsRun = true;

          if (!step.isEmpty()) await this.waiter.waitTransaction();
        }
      } catch (error) {
        logger.debug(String(error));
        logger.error((error as Error).message);

        await this.creator.updateTask(task);

        await sleep(5);
      }
    }

    this.prevRun.task = task;

    logger.info(createMessage(account, `step finish`));

    return isTransactionsRun;
  }

  private initCommandListener() {
    readline
      .createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      .on("line", (input) => {
        this.rlCommands(input.trim());
      })
      .on("SIGTERM", () => {
        process.exit();
      })
      .on("SIGINT", () => {
        process.exit();
      })
      .on("close", () => {
        process.exit();
      });
  }

  private rlCommands(cmd: string) {
    switch (cmd) {
      case "status": {
        // eslint-disable-next-line no-console
        console.info(this.creator.getAllTasksInfoStr());
        break;
      }
      case "exit": {
        process.exit();
        break;
      }
      default: {
        // eslint-disable-next-line no-console
        console.error("command not found");
      }
    }
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

    logger.info(`possible routes:\n${factoryInfoStr}`);

    await confirmRun();

    this.initCommandListener();

    while (!this.creator.isEmpty()) {
      const isTransactionsRun = await this.runTask();
      this.prevRun.isTransactionsRun = isTransactionsRun;
    }
  }
}

export default TasksRunner;
