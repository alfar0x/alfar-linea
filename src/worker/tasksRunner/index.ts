import readline from "readline";

import Linea from "../../chain/linea";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Proxy from "../../core/proxy";
import confirmRun from "../../utils/cli/confirmRun";
import formatError from "../../utils/formatters/formatError";
import formatMessages from "../../utils/formatters/formatMessages";
import logger from "../../utils/other/logger";
import sleep from "../../utils/other/sleep";
import waitInternetConnection from "../../utils/other/waitInternetConnection";
import randomShuffle from "../../utils/random/randomShuffle";

import TasksRunnerConfig from "./config";
import getAccounts from "./helpers/getAccounts";
import getProxies from "./helpers/getProxies";
import printTasks from "./helpers/printTasks";
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

    const providerOptions = { agent: https };

    this.chain.updateHttpProviderOptions({ providerOptions });

    await this.proxy.onProviderChange();
  }

  // eslint-disable-next-line require-await
  @waitInternetConnection()
  private async runTestTransaction() {
    logger.debug(
      formatMessages(this.state.account, this.state.transaction, `running...`),
    );

    const isSuccess = Math.random() > 1;

    if (!isSuccess) {
      throw new Error(formatMessages("failed"));
    }

    this.state.isTxRun = true;
    this.state.isAtLeastOneTxRun = true;

    this.state.task.onTransactionSuccess(0.5);
  }

  @waitInternetConnection()
  private async runTransaction() {
    await this.waiter.waitGasLimit();

    const { maxTxFeeUsd } = this.config.dynamic();

    const txResult = await this.state.transaction.run({ maxTxFeeUsd });

    if (!txResult) return;

    const { hash, resultMsg, fee } = txResult;

    const message = formatMessages(
      this.state.transaction,
      resultMsg,
      `fee:$${fee}`,
      this.chain.getHashLink(hash),
    );

    logger.info(formatMessages(this.state.account, message));

    this.state.isTxRun = true;
    this.state.isAtLeastOneTxRun = true;

    this.state.task.onTransactionSuccess(fee);
  }

  private async runStep() {
    while (!this.state.step.isEmpty()) {
      await this.runTransaction();

      // await this.runTestTransaction();

      if (this.state.isTxRun && !this.state.step.isEmpty()) {
        await this.waiter.waitTransaction();
      }

      this.state.onTransactionEnd();
    }
  }

  private async onStepFailed(error: Error) {
    const msg = formatMessages(
      this.state.account,
      `${this.state.transaction} failed`,
      `details: ${error.message}`,
    );

    if (this.state.isSupportStepsAvailable) {
      logger.warn(msg);
    } else {
      logger.error(msg);
    }

    logger.debug(formatError(error));

    await sleep(10);
  }

  private async runOperation() {
    this.state.isSupportStepsAvailable = this.state.operation.size() > 1;

    while (!this.state.operation.isEmpty()) {
      try {
        await this.runStep();
        return;
      } catch (error) {
        await this.onStepFailed(error as Error);
      }

      this.state.onStepEnd();
    }

    this.state.isOperationFailed = true;
    if (this.state.isSupportStepsAvailable) {
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

  private async initialize() {
    const { files, proxy } = this.config.fixed;

    const accounts = await getAccounts({ baseFileName: files.privateKeys });

    const proxies = await getProxies({
      baseFileName: files.proxies,
      accountsLength: accounts.length,
      isServerRandom: proxy.type === "server" && proxy.serverIsRandom,
    });

    this._proxy = new Proxy({ ...proxy, proxies });

    const configInfo = this.config.info();
    const accountsInfo = accounts.length;
    const factoryInfo = this.creator.factoryInfo();
    const proxyInfo = this._proxy.info();

    logger.info(`config:\n${configInfo}`);
    logger.info(`accounts: ${accountsInfo}`);
    logger.info(`proxies: ${proxyInfo}`);
    logger.info(`possible routes: ${factoryInfo}`);

    await confirmRun();

    await this.creator.initializeTasks(randomShuffle(accounts));

    this.initCommandListener();
  }

  public async run() {
    await this.initialize();

    while (!this.creator.isEmpty()) await this.runTask();

    logger.info("all tasks finished");

    printTasks(this.creator.getTasks());

    process.exit();
  }
}

export default TasksRunner;
