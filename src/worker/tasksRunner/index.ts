import readline from "readline";

import Linea from "../../chain/linea";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Operation from "../../core/operation";
import Proxy from "../../core/proxy";
import Step from "../../core/step";
import RunnableTransaction from "../../core/transaction";
import createMessage from "../../utils/other/createMessage";
import logger from "../../utils/other/logger";
import prettifyError from "../../utils/other/prettifyError";
import sleep from "../../utils/other/sleep";
import waitInternetConnectionWrapper from "../../utils/other/waitInternetConnectionWrapper";
import randomShuffle from "../../utils/random/randomShuffle";

import TasksRunnerConfig from "./config";
import confirmRun from "./confirmRun";
import initializeAccounts from "./initializeAccounts";
import initializeProxy from "./initializeProxy";
import printTasks from "./printTasks";
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

      const txResult = await transaction.run({ maxTxFeeUsd });

      if (!txResult) return false;

      const { hash, resultMsg, gasPriceUsd } = txResult;

      const message = createMessage(
        transaction,
        resultMsg,
        `fee:$${gasPriceUsd}`,
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

  private async runOperation(operation: Operation, account: Account) {
    let isTransactionsRun = false;

    const isSupportStepsAvailable = operation.size() > 1;

    while (!operation.isEmpty()) {
      const step = operation.getNextStep();

      if (!step) {
        throw new Error(`step is not found`);
      }

      if (step.isEmpty()) {
        throw new Error(`step is empty`);
      }

      try {
        isTransactionsRun = await this.runStep(step);

        return { isTransactionsRun, isOperationFailed: false };
      } catch (error) {
        if (isSupportStepsAvailable) {
          logger.warn(
            createMessage(account, `${step} failed`, `getting support step`),
          );
        } else {
          logger.error(createMessage(account, `${step} failed`));
        }
        logger.debug(prettifyError.render(error as Error));
      }

      await sleep(10);
    }

    if (isSupportStepsAvailable) {
      logger.error(`all operation steps failed`);
    }

    return { isTransactionsRun, isOperationFailed: true };
  }

  private async runTask() {
    const task = await this.creator.getNextInProgressTask();

    if (!task) {
      throw new Error(`in progress task is not found`);
    }

    const { account } = task;

    const isSameTask =
      this.prevRun.task !== null && this.prevRun.task.isEquals(task);

    if (!isSameTask) {
      await this.changeChainProvider(account);
    }

    if (this.prevRun.isTransactionsRun) await this.waiter.waitStep();

    const operation = task.getNextOperation();

    if (!operation) {
      throw new Error(`operation is not found`);
    }

    if (operation.isEmpty()) {
      throw new Error(`operation is empty`);
    }

    logger.debug(createMessage(account, `operation start: ${operation}`));

    const { isTransactionsRun, isOperationFailed } = await this.runOperation(
      operation,
      account,
    );

    this.prevRun.task = task;

    logger.debug(createMessage(account, `operation finish`));

    await this.creator.onTaskOperationEnd(task, { isForce: isOperationFailed });

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
        printTasks(this.creator.getTasks());
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
    const { files, proxy } = this.config.fixed;

    const accounts = await initializeAccounts({
      baseFileName: files.privateKeys,
    });

    this._proxy = await initializeProxy({
      proxyConfig: proxy,
      baseFileName: files.proxies,
      accountsLength: accounts.length,
    });

    logger.info(`accounts found: ${accounts.length}`);

    const factoryInfoStr = this.creator.getFactoryInfoStr();

    logger.info(`possible routes:\n${factoryInfoStr}`);

    await confirmRun();

    await this.creator.initializeTasks(randomShuffle(accounts));

    this.initCommandListener();

    while (!this.creator.isEmpty()) {
      const isTransactionsRun = await this.runTask();
      this.prevRun.isTransactionsRun = isTransactionsRun;
    }

    logger.info("all tasks finished");
    printTasks(this.creator.getTasks());

    process.exit();
  }
}

export default TasksRunner;
