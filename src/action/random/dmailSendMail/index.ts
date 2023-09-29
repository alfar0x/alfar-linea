import { Transaction } from "web3";

import Account from "../../../core/account";
import Chain from "../../../core/chain";
import Step from "../../../core/step";
import RunnableTransaction from "../../../core/transaction";
import RandomAction from "../base";

import ActionContext from "../../../core/actionContext";
import generateEmail from "../../../utils/random/randomEmail";
import { ChainConfig } from "../../../core/actionConfig";
import config from "./config";

class DmailSendMailAction extends RandomAction {
  private readonly config: ChainConfig<typeof config>;

  public constructor(params: { chain: Chain; context: ActionContext }) {
    super({ ...params, provider: "DMAIL", operation: "SEND_MAIL" });

    this.config = config.getChainConfig(params.chain);
  }

  private async sendMail(params: { account: Account }) {
    const { account } = params;
    const { dmailAddress, dmailContract } = this.config;
    const { w3 } = this.chain;

    const emailAddress = generateEmail();

    const sendFunctionCall = dmailContract(w3, dmailAddress).methods.send_mail(
      emailAddress,
      emailAddress,
    );

    const estimatedGas = await sendFunctionCall.estimateGas({
      from: account.address,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx: Transaction = {
      data: sendFunctionCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: dmailAddress,
      value: 0,
    };

    return { tx, resultMsg: "email sent" };
  }

  private getCreateSendMailTransaction(params: { account: Account }) {
    const { account } = params;

    const createSendMailTransaction = async () => {
      return await this.sendMail({ account });
    };

    return createSendMailTransaction;
  }

  public steps(params: { account: Account }) {
    const { account } = params;

    const step = new Step({ name: this.name });

    const createTransaction = this.getCreateSendMailTransaction({ account });

    const sendMailTransaction = new RunnableTransaction({
      name: this.getTxName("SEND"),
      chain: this.chain,
      account: account,
      createTransaction,
    });

    step.push(sendMailTransaction);

    return [step];
  }
}

export default DmailSendMailAction;
