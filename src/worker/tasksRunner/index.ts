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
import TaskCreator from "./taskCreator";
import Waiter from "./waiter";

class TasksRunner {
  private readonly config: TasksRunnerConfig;
  private readonly chain: Chain;
  private readonly creator: TaskCreator;
  private readonly waiter: Waiter;

  private _proxy: Proxy | null;

  public constructor(configFileName: string) {
    this.config = new TasksRunnerConfig({ configFileName });

    const { rpc } = this.config.fixed;

    this.chain = new Linea({ rpc: rpc.linea });

    this._proxy = null;

    this.creator = new TaskCreator({ chain: this.chain, config: this.config });

    this.waiter = new Waiter({ chain: this.chain, config: this.config });
  }

  private get proxy() {
    if (!this._proxy) {
      throw new Error("unexpected error. proxy is not defined");
    }

    return this._proxy;
  }

  private changeChainProvider(account: Account) {
    const https = this.proxy.getHttpsTunnelByIndex(account.fileIndex);

    if (!https) return;

    const httpProviderOptions = { providerOptions: { agent: { https } } };

    this.chain.updateHttpProviderOptions({ httpProviderOptions });
  }

  private async runTransaction(
    step: Step,
    isConnectionChecked = false,
  ): Promise<readonly [false] | readonly [true, string]> {
    const transaction = step.getNextTransaction();

    if (!transaction) return [false];

    try {
      await this.waiter.waitGasLimit();

      const txResult = await transaction.run({});

      if (!txResult) return [false];

      const { hash, resultMsg } = txResult;

      const message = createMessage(
        transaction.name,
        "success",
        resultMsg,
        this.chain.getHashLink(hash),
      );

      return [true, message];
    } catch (error) {
      const msg = `[${transaction}] ${(error as Error).message}`;

      if (isConnectionChecked) throw new Error(msg);

      const myIp = await getMyIp();

      if (myIp) throw new Error(msg);

      await waitInternetConnection();

      return this.runTransaction(step, true);
    }
  }

  private async runTask(isStepSleep = true) {
    const task = await this.creator.getNextTask();

    if (!task) return false;

    const step = task.getNextStep();

    if (!step || step.isEmpty()) return false;

    if (isStepSleep) await this.waiter.waitStep();

    const { account } = task;

    this.changeChainProvider(account);

    logger.info(createMessage(account, `step start: ${step}`));

    while (!step.isEmpty()) {
      const [isSuccess, message] = await this.runTransaction(step);

      if (isSuccess) {
        logger.info(createMessage(account, message));

        if (!step.isEmpty()) await this.waiter.waitTransaction();
      }
    }

    logger.info(createMessage(account, `step finish: ${step}`));

    await this.proxy.postRequest();

    return true;
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

    logger.info(createMessage("Possible routes:\n", factoryInfoStr));

    await confirmRun();

    // should not sleep before first step
    let isBeforeStepSleep = false;

    while (!this.creator.isEmpty()) {
      const isSuccess = await this.runTask(isBeforeStepSleep);

      isBeforeStepSleep = isSuccess;
    }
  }
}

export default TasksRunner;
