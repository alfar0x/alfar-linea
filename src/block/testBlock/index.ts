import Account from "../../core/account";
import Block from "../../core/block";
import Step from "../../core/step";
import Transaction from "../../core/transaction";
import sleep from "../../common/sleep";

class TestBlock extends Block {
  name = "TEST_BLOCK";

  async firstStartTransaction(account: Account) {
    const logger = this.getLogger(account);
    logger.debug(`first start transaction started`);
    await sleep(5);
    logger.debug(`first start transaction ended`);
    return false;
  }

  async secondStartTransaction(account: Account) {
    const logger = this.getLogger(account);
    logger.debug(`second start transaction started`);
    await sleep(5);
    logger.debug(`second start transaction ended`);
    return true;
  }

  async thirdStartTransaction(account: Account) {
    const logger = this.getLogger(account);
    logger.debug(`third start transaction started`);
    await sleep(5);
    logger.debug(`third start transaction ended`);
    return true;
  }

  async firstResetTransaction(account: Account) {
    const logger = this.getLogger(account);
    logger.debug(`first reset transaction started`);
    await sleep(5);
    logger.debug(`first reset transaction ended`);
    return true;
  }

  async secondResetTransaction(account: Account) {
    const logger = this.getLogger(account);
    logger.debug(`second reset transaction started`);
    await sleep(5);
    logger.debug(`second reset transaction ended`);
    return true;
  }

  startSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`start steps getting start`);

    const firstStep = new Step({
      name: this.createDefaultStepName("first-start-step"),
      transactions: [],
    });

    const firstTransaction = new Transaction({
      name: firstStep.createDefaultTransactionName("first-tx"),
      fn: () => this.firstStartTransaction(account),
    });
    firstStep.push(firstTransaction);

    const secondTransaction = new Transaction({
      name: firstStep.createDefaultTransactionName("second-tx"),
      fn: () => this.secondStartTransaction(account),
    });
    firstStep.push(secondTransaction);

    const secondStep = new Step({
      name: this.createDefaultStepName("second-start-step"),
      transactions: [],
    });

    const thirdTransaction = new Transaction({
      name: secondStep.createDefaultTransactionName("third-tx"),
      fn: () => this.thirdStartTransaction(account),
    });
    secondStep.push(thirdTransaction);

    logger.debug(`start steps getting end`);

    return [firstStep, secondStep];
  }

  allSteps(account: Account) {
    const startSwapSteps = this.startSteps(account);
    const resetSwapSteps = this.resetSteps(account);
    return [...startSwapSteps, ...resetSwapSteps];
  }

  resetSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`reset steps getting start`);

    const firstStep = new Step({
      name: this.createDefaultStepName("first-reset-step"),
      transactions: [],
    });

    const firstTransaction = new Transaction({
      name: firstStep.createDefaultTransactionName("first-tx"),
      fn: () => this.firstResetTransaction(account),
    });
    firstStep.push(firstTransaction);

    const secondTransaction = new Transaction({
      name: firstStep.createDefaultTransactionName("second-tx"),
      fn: () => this.secondResetTransaction(account),
    });
    firstStep.push(secondTransaction);

    logger.debug(`reset steps getting end`);

    return [firstStep];
  }
}

export default TestBlock;
