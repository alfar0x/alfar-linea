import readline from "readline";

import Linea from "../../chain/linea";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Proxy from "../../core/proxy";
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
import TaskCreator from "./taskCreator";
import Waiter from "./waiter";
import WorkerState from "./workerState";

class TasksRunner {
  private readonly config: TasksRunnerConfig;
  private readonly chain: Chain;
  private readonly creator: TaskCreator;
  private readonly waiter: Waiter;
  private readonly state: WorkerState;

  private _proxy: Proxy | null;

  public constructor(configFileName: string) {
    this.config = new TasksRunnerConfig({ configFileName });
    this.chain = new Linea({ rpc: this.config.fixed.rpc.linea });
    this.creator = new TaskCreator({ chain: this.chain, config: this.config });
    this.waiter = new Waiter({ chain: this.chain, config: this.config });
    this.state = new WorkerState();

    this._proxy = null;
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

  private runTestTransaction() {
    const { transaction, account, task } = this.state;

    logger.debug(createMessage(account, transaction, `running...`));

    const isSuccess = Math.random() > 0.5;

    if (!isSuccess) {
      throw new Error(createMessage("failed"));
    }

    this.state.isTxRun = true;
    this.state.isAtLeastOneTxRun = true;

    task.onTransactionSuccess(0.5);
  }

  private async runTransaction() {
    const { transaction, account, task } = this.state;

    await this.waiter.waitGasLimit();

    const { maxTxFeeUsd } = this.config.dynamic();

    const txResult = await transaction.run({ maxTxFeeUsd });

    if (!txResult) return;

    const { hash, resultMsg, fee } = txResult;

    const message = createMessage(
      transaction,
      resultMsg,
      `fee:$${fee}`,
      this.chain.getHashLink(hash),
    );

    logger.info(createMessage(account, message));

    this.state.isTxRun = true;
    this.state.isAtLeastOneTxRun = true;

    task.onTransactionSuccess(fee);
  }

  private async runStep() {
    const { step } = this.state;

    while (!step.isEmpty()) {
      const wrappedRunner = waitInternetConnectionWrapper(
        this.runTransaction.bind(this),
      );
      await wrappedRunner();

      // this.runTestTransaction();

      if (this.state.isTxRun && !step.isEmpty()) {
        await this.waiter.waitTransaction();
      }

      this.state.onTransactionEnd();
    }
  }

  private async onStepFailed(params: {
    isSupportStepsAvailable: boolean;
    error: Error;
  }) {
    const { isSupportStepsAvailable, error } = params;

    const { account, transaction } = this.state;

    if (isSupportStepsAvailable) {
      logger.warn(
        createMessage(account, `${transaction} failed`, `getting support step`),
      );
    } else {
      logger.error(createMessage(account, `${transaction} failed`));
    }

    logger.debug(prettifyError.render(error));

    await sleep(10);
  }

  private async runOperation() {
    const { operation } = this.state;

    const isSupportStepsAvailable = operation.size() > 1;

    while (!operation.isEmpty()) {
      try {
        await this.runStep();
        return;
      } catch (error) {
        await this.onStepFailed({
          isSupportStepsAvailable,
          error: error as Error,
        });
      }

      this.state.onStepEnd();
    }

    this.state.isOperationFailed = true;

    if (isSupportStepsAvailable) {
      logger.error(`all operation steps failed`);
    }
  }

  private async runTask() {
    const task = await this.creator.getNextInProgressTask();

    if (!task) throw new Error(`in progress task is not found`);

    this.state.task = task;

    if (this.state.isDifferentTask)
      await this.changeChainProvider(task.account);

    if (this.state.isAtLeastOnePrevTxRun) await this.waiter.waitStep();

    await this.runOperation();

    await this.creator.onTaskOperationEnd(task, this.state.isOperationFailed);

    this.state.onOperationEnd();
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

    while (!this.creator.isEmpty()) await this.runTask();

    logger.info("all tasks finished");

    printTasks(this.creator.getTasks());

    process.exit();
  }
}

export default TasksRunner;
