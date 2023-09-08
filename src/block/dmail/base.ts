import Account from "../../core/account";
import Block from "../../core/block";
import Step from "../../core/step";
import Transaction from "../../core/transaction";
import Dmail from "../../action/dmail";

class BaseDmail extends Block {
  name = "";

  private async sendMail(account: Account) {
    const logger = this.getLogger(account);

    const dmail = new Dmail();
    const hash = await dmail.sendMail(account, this.chain);

    const hashLink = this.chain.getHashLink(hash);

    logger.info(`send dmail mail success: ${hashLink}`);

    return true;
  }

  startSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`getting start steps`);

    const step = new Step({
      name: this.createDefaultStepName("start"),
      transactions: [],
    });

    const sendTransaction = new Transaction({
      name: step.createDefaultTransactionName("sendMail"),
      fn: () => this.sendMail(account),
    });

    step.push(sendTransaction);

    return [step];
  }

  allSteps(account: Account) {
    const startSwapSteps = this.startSteps(account);
    return [...startSwapSteps];
  }

  resetSteps() {
    return [];
  }
}

export default BaseDmail;
