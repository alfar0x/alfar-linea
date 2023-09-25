import readline from "readline";

import Linea from "../../chain/linea";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Operation from "../../core/operation";
import Proxy from "../../core/proxy";
import Step from "../../core/step";
import RunnableTransaction from "../../core/transaction";
import createMessage from "../../utils/other/createMessage";
import env from "../../utils/other/env";
import logger from "../../utils/other/logger";
import prettifyError from "../../utils/other/prettifyError";
import sleep from "../../utils/other/sleep";
import waitInternetConnectionWrapper from "../../utils/other/waitInternetConnectionWrapper";

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
    transaction: RunnableTransaction,
  ): Promise<boolean> {
    try {
      const { maxTxFeeUsd } = this.config.dynamic();

      await this.waiter.waitGasLimit();

      // worker test
      const txResult = env.WORKER_TEST
        ? { hash: "", resultMsg: "msg", gasPriceUsd: "0" }
        : await transaction.run({ maxTxFeeUsd });

      if (!txResult) return false;

      const { hash, resultMsg, gasPriceUsd } = txResult;

      const message = createMessage(
        transaction,
        "success",
        resultMsg,
        `fee: $${gasPriceUsd}`,
        this.chain.getHashLink(hash),
      );

      logger.info(createMessage(transaction.account, message));

      return true;
    } catch (error) {
      throw new Error(createMessage(transaction, (error as Error).message));
    }
  }

  private async runStep(step: Step) {
    let isTransactionsRun = false;

    while (!step.isEmpty()) {
      const transaction = step.getNextTransaction();

      if (!transaction) break;

      const wrapped = waitInternetConnectionWrapper(
        this.runTransaction.bind(this),
      );

      const isRun = await wrapped(transaction);

      if (isRun) {
        isTransactionsRun = true;

        if (!step.isEmpty()) await this.waiter.waitTransaction();
      }
    }

    return isTransactionsRun;
  }

  private async runOperation(operation: Operation) {
    while (!operation.isEmpty()) {
      const step = operation.getNextStep();

      if (!step) break;

      try {
        return await this.runStep(step);
      } catch (error) {
        logger.error(createMessage(step, `step failed`, `generating new step`));
        logger.debug(error as Error);
      }
    }

    throw new Error(createMessage(operation, `all operation steps failed`));
  }

  private async runTask() {
    const task = await this.creator.getNextTask();

    if (!task) return false;

    const { account } = task;

    const isDifferentTaskNow =
      this.prevRun.task === null || !this.prevRun.task.isEquals(task);

    if (isDifferentTaskNow) {
      await this.changeChainProvider(account);
    }

    if (this.prevRun.isTransactionsRun) await this.waiter.waitStep();

    const operation = task.getNextOperation();

    if (!operation || operation.isEmpty()) {
      await this.creator.updateTask(task);
      return false;
    }

    logger.debug(createMessage(account, `step start: ${operation}`));

    let isTransactionsRun = false;

    try {
      isTransactionsRun = await this.runOperation(operation);
    } catch (error) {
      logger.error((error as Error).message);
      logger.debug(prettifyError.render(error as Error));

      await this.creator.updateTask(task);

      await sleep(5);
    }

    this.prevRun.task = task;

    logger.debug(createMessage(account, `step finish`));

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

    await this.creator.initializeTasks(accounts);

    const factoryInfoStr = this.creator.getFactoryInfoStr();

    logger.info(`possible routes:\n${factoryInfoStr}`);

    await confirmRun();

    this.initCommandListener();

    while (!this.creator.isEmpty()) {
      const isTransactionsRun = await this.runTask();
      this.prevRun.isTransactionsRun = isTransactionsRun;
    }

    logger.info("all tasks finished");
    process.exit();
  }
}

export default TasksRunner;
