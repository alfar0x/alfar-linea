import Big from "big.js";
import tunnel from "tunnel";
import { HttpProvider } from "web3";

import Linea from "../../chain/linea";
import BlockConfig from "../../config/tasksGenerator";
import Account from "../../core/account";
import Chain from "../../core/chain";
import Proxy from "../../core/proxy";
import Transaction from "../../core/transaction";
import Factory from "../../factory/taskFactory";
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
import Task from "./task";

const WAIT_GAS_SEC = 10 * 60;

class TaskGenerator {
  private config: BlockConfig;
  private chain: Chain;
  private proxy: Proxy | null;
  private tasks: Task[];
  private factory: Factory;
  private accountsLeft: Account[];

  public constructor(configFileName: string) {
    this.config = new BlockConfig({ configFileName });

    const { rpc, providers, workingAmountPercent } = this.config.fixed;

    this.chain = new Linea({ rpc: rpc.linea });

    this.accountsLeft = [];

    this.proxy = null;

    this.factory = initializeFactory({
      chain: this.chain,
      activeProviders: providers,
      minWorkAmountPercent: workingAmountPercent.min,
      maxWorkAmountPercent: workingAmountPercent.max,
    });

    this.tasks = [];
  }

  private msg(texts: string[]) {
    return texts.join(" | ");
  }

  private async updateTasks() {
    const { maxParallelAccounts } = this.config.fixed;

    while (this.tasks.length < maxParallelAccounts) {
      const account = this.accountsLeft.shift();

      if (!account) return;

      try {
        const task = await this.createTask(account);

        if (task) this.tasks.push(task);
      } catch (error) {
        logger.error(
          this.msg([
            String(account),
            "create task error",
            (error as Error).message,
          ]),
        );
      }
    }

    logger.info(
      this.msg([
        `current tasks ${this.tasks.length}`,
        `accounts left: ${this.accountsLeft.length}`,
      ]),
    );
  }

  private async isBalanceAllowed(account: Account) {
    const native = this.chain.getNative();

    const nativeReadableBalance = await native.readableBalanceOf(
      account.address,
    );

    const { minEthBalance } = this.config.dynamic();

    const isAllowed = Big(nativeReadableBalance).gte(minEthBalance);

    return { isAllowed, nativeReadableBalance, minEthBalance };
  }

  private async createTask(account: Account): Promise<Task | null> {
    const { transactionsLimit } = this.config.fixed;

    const { isAllowed, nativeReadableBalance, minEthBalance } =
      await this.isBalanceAllowed(account);

    if (!isAllowed) {
      logger.error(
        this.msg([
          String(account),
          `account was filtered due to insufficient ETH balance`,
          `${nativeReadableBalance} < ${minEthBalance}`,
        ]),
      );
      return null;
    }

    const minimumTransactionsLimit = randomInteger(
      transactionsLimit.min,
      transactionsLimit.max,
    ).toNumber();

    const steps = await this.factory.getRandomSteps({
      account,
    });

    const task = new Task({ account, minimumTransactionsLimit, steps });

    logger.info(
      this.msg([String(account), `task was generated: ${task.toString()}`]),
    );

    return task;
  }

  private changeChainProvider(account: Account) {
    if (!this.proxy) {
      throw new Error("Unexpected error. Proxy was not initialized");
    }

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

  private async removeTask(task: Task) {
    this.tasks = this.tasks.filter((taskItem) => !taskItem.isEquals(task));

    logger.info(this.msg([`${task.account}`, `account was removed from list`]));

    await this.updateTasks();
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
      this.msg([`next transaction run ${nextTransactionRunTimeStr}`]),
    );

    await sleep(nextTransactionRunSec);
  }

  private async runTransaction(
    transaction: Transaction,
    isConnectionChecked = false,
  ): Promise<boolean> {
    try {
      await waitGasPrice(
        this.chain.w3,
        WAIT_GAS_SEC,
        () => this.config.dynamic().maxLineaGwei,
      );

      return await transaction.run();
    } catch (error) {
      const msg = `[${transaction}] ${(error as Error).message}`;

      if (isConnectionChecked) throw new Error(msg);

      const myIp = await getMyIp();

      if (myIp) throw new Error(msg);

      await waitInternetConnection();

      return this.runTransaction(transaction, true);
    }
  }

  private async runStep(task: Task, isStepSleep = false) {
    const step = task.nextStep();

    if (!step) return;

    let transaction = step.shift();

    if (transaction && isStepSleep) await this.waitBeforeStep();

    logger.info(this.msg([String(task.account), `step start: ${step}`]));

    while (transaction) {
      const isTransactionSent = await this.runTransaction(transaction);

      transaction = step.shift();

      if (transaction && isTransactionSent) await this.waitAfterTransaction();
    }

    logger.info(this.msg([String(task.account), `step finish: ${step}`]));
  }

  private async runRandomTask(isStepSleep = true) {
    const task = randomChoice(this.tasks);

    const { isAllowed, nativeReadableBalance, minEthBalance } =
      await this.isBalanceAllowed(task.account);

    if (!isAllowed) {
      logger.error(
        this.msg([
          String(task.account),
          `account was filtered due to insufficient ETH balance`,
          `${nativeReadableBalance} < ${minEthBalance}`,
        ]),
      );

      await this.removeTask(task);

      return "TASK_SKIP";
    }

    try {
      this.changeChainProvider(task.account);

      await this.runStep(task, isStepSleep);

      if (!task.isEmpty()) return "STEP_SUCCESS";

      if (task.isMinimumTransactionsLimitReached()) {
        const transactionsPerformed = task.account.transactionsPerformed();

        logger.info(
          this.msg([
            String(task.account),
            `account task success`,
            `transactions performed: ${transactionsPerformed}`,
          ]),
        );

        if (!this.proxy) {
          throw new Error("Unexpected error. Proxy was not initialized");
        }

        await this.proxy.postRequest();

        await this.removeTask(task);

        return "TASK_SUCCESS";
      }

      const newSteps = await this.factory.getRandomSteps({
        account: task.account,
      });

      task.setNextSteps(newSteps);

      logger.info(
        this.msg([
          String(task.account),
          `task success`,
          `new steps generated: ${task.toString()}`,
        ]),
      );

      return "STEP_SUCCESS_STEPS_ADDED";
    } catch (error) {
      logger.error(
        this.msg([
          String(task.account),
          `step error: ${(error as Error).message}`,
        ]),
      );

      if (task.isMinimumTransactionsLimitReached()) {
        if (!this.proxy) {
          throw new Error("Unexpected error. Proxy was not initialized");
        }

        await this.proxy.postRequest();

        await this.removeTask(task);

        return "TASK_ERROR";
      }
      const newSteps = await this.factory.getRandomSteps({
        account: task.account,
      });

      task.setNextSteps(newSteps);

      return "TASK_ERROR_STEPS_ADDED";
    }
  }

  public async run() {
    const { files, isAccountsShuffle, proxy } = this.config.fixed;

    this.accountsLeft = await initializeAccounts({
      baseFileName: files.privateKeys,
      isShuffle: isAccountsShuffle,
    });

    this.proxy = await initializeProxy({
      proxyConfig: proxy,
      baseFileName: files.proxies,
      accountsLength: this.accountsLeft.length,
    });

    logger.info(this.factory.infoString());

    await this.updateTasks();

    await confirmRun();

    // should not sleep before first step
    let isBeforeStepSleep = false;

    while (this.tasks.length) {
      const status = await this.runRandomTask(isBeforeStepSleep);

      isBeforeStepSleep = status !== "TASK_SKIP";
    }
  }
}

export default TaskGenerator;
