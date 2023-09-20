import DmailSendMailAction from "../../../action/other/dmailSendMail";
import Account from "../../../core/account";
import Chain from "../../../core/chain";
import Step from "../../../core/step";
import Transaction from "../../../core/transaction";
import RandomStep from "../../random";

class DmailSendMailStep extends RandomStep {
  private action: DmailSendMailAction;

  constructor(params: { chain: Chain }) {
    const { chain } = params;

    const action = new DmailSendMailAction();

    const { name } = action;

    super({ name, chain });

    this.action = action;
  }

  private async sendMail(account: Account) {
    const logger = this.getLogger(account);

    const hash = await this.action.sendMail(account, this.chain);

    const hashLink = this.chain.getHashLink(hash);

    logger.info(`send dmail mail success: ${hashLink}`);

    return true;
  }

  startSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`getting start steps`);

    const step = new Step({
      name: this.createDefaultStepName("SEND_MAIL"),
      transactions: [],
    });

    const sendTransaction = new Transaction({
      name: step.createDefaultTransactionName("SEND_MAIL"),
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

export default DmailSendMailStep;
