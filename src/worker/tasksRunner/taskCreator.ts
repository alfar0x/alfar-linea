import Big from "big.js";

import Account from "../../core/account";
import Chain from "../../core/chain";
import TaskFactory from "../../factory/taskFactory";
import createMessage from "../../utils/other/createMessage";
import logger from "../../utils/other/logger";
import randomInteger from "../../utils/random/randomInteger";

import TasksRunnerConfig from "./config";
import initializeFactory from "./initializeFactory";
import Task from "./task";

class TaskCreator {
  private config: TasksRunnerConfig;
  private tasks: Task[];
  private factory: TaskFactory;
  private chain: Chain;

  public constructor(params: { chain: Chain; config: TasksRunnerConfig }) {
    const { chain, config } = params;

    this.config = config;
    this.chain = chain;

    const { providers, workingAmountPercent } = this.config.fixed;

    this.factory = initializeFactory({
      chain: this.chain,
      activeProviders: providers,
      minWorkAmountPercent: workingAmountPercent.min,
      maxWorkAmountPercent: workingAmountPercent.max,
    });

    this.tasks = [];
  }

  private async checkIsBalanceAllowed(account: Account) {
    const native = this.chain.getNative();
    const { minEthBalance } = this.config.dynamic();

    const minEthNormalizedBalance =
      await native.toNormalizedAmount(minEthBalance);

    const normalizedBalance = await native.readableBalanceOf(account.address);

    const isAllowed = Big(normalizedBalance).gte(minEthNormalizedBalance);

    if (!isAllowed) {
      const readableBalance = await native.toReadableAmount(normalizedBalance);
      throw new Error(
        createMessage(
          `insufficient native balance`,
          `${readableBalance} < ${minEthBalance}`,
        ),
      );
    }
  }

  private async initializeTask(account: Account) {
    const { transactionsLimit, shouldCheckBalanceOnStart } = this.config.fixed;

    if (shouldCheckBalanceOnStart) {
      await this.checkIsBalanceAllowed(account);
    }

    const minimumTransactionsLimit = randomInteger(
      transactionsLimit.min,
      transactionsLimit.max,
    ).toNumber();

    return new Task({ account, minimumTransactionsLimit });
  }

  public async initializedTasks(accounts: Account[]) {
    const tasks: Task[] = [];

    for (const account of accounts) {
      try {
        const task = await this.initializeTask(account);
        tasks.push(task);
      } catch (error) {
        logger.error(createMessage(account, (error as Error).message));
      }
    }
  }

  public isEmpty() {
    return !this.tasks.length;
  }

  private async checkIsTaskAllowed(task: Task) {
    const { account } = task;

    try {
      await this.checkIsBalanceAllowed(account);

      if (!task.isEmpty()) return true;

      if (task.isMinimumTransactionsLimitReached()) {
        logger.info(
          createMessage(
            account,
            "success",
            `txs limit reached: ${task.minimumTransactionsLimit}`,
          ),
        );
        this.removeTask(task);
        return false;
      }

      logger.info(
        createMessage(account, `new steps created: ${task.stepsString()}`),
      );

      const steps = await this.factory.getRandomSteps({ account });

      task.pushMany(...steps);

      return true;
    } catch (error) {
      // eslint-disable-next-line prefer-destructuring
      const message = (error as Error).message;

      logger.error(createMessage(account, `error: ${message}`));
      this.removeTask(task);
      return false;
    }
  }

  private removeTask(task: Task) {
    this.tasks = this.tasks.filter((taskItem) => !taskItem.isEquals(task));

    logger.info(
      createMessage(
        `${task.account}`,
        `account was removed from list`,
        `tasks left: ${this.tasks.length}`,
      ),
    );
  }

  public getFactoryInfoStr() {
    return this.factory.info().join("\n");
  }

  public async getNextTask() {
    const { maxParallelAccounts } = this.config.fixed;

    while (!this.isEmpty()) {
      const maxIndexBaseOnOne = Math.min(
        this.tasks.length,
        maxParallelAccounts,
      );
      const maxIndex = maxIndexBaseOnOne - 1;
      const randomIndex = randomInteger(0, maxIndex).toNumber();

      const task = this.tasks[randomIndex];

      const isAllowed = await this.checkIsTaskAllowed(task);

      if (isAllowed) return task;
    }

    return null;
  }
}

export default TaskCreator;
