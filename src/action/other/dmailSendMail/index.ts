import { randomInt } from "crypto";

import { CONTRACT_DMAIL } from "../../../constants/contracts";
import Account from "../../../core/account";
import Action from "../../../core/action";
import Chain from "../../../core/chain";
import randomChoice from "../../../utils/random/randomChoice";
import getContract from "../../../utils/web3/getContract";

class DmailSendMail extends Action {
  constructor() {
    super({
      provider: "DMAIL",
      actionType: "SEND_MAIL",
    });
  }

  private getRandomSymbols(length: number) {
    const symbols =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    const randomStringArray = Array.from({ length }, () => {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      return symbols.charAt(randomIndex);
    });

    return randomStringArray.join("");
  }

  private generateEmail() {
    const domains = ["dmail.ai", "gmail.com"];

    const address = this.getRandomSymbols(randomInt(8, 15));
    const domain = randomChoice(domains);
    return `${address}@${domain}`;
  }

  private async getSendCall(params: {
    chain: Chain;
    dmailContractAddress: string;
  }) {
    const { chain, dmailContractAddress } = params;

    const { w3 } = chain;

    const dmailContract = getContract({
      w3,
      name: CONTRACT_DMAIL,
      address: dmailContractAddress,
    });

    const emailAddress = this.generateEmail();

    return dmailContract.methods.send_mail(emailAddress, emailAddress);
  }

  private async checkIsAllowed(chain: Chain) {
    const dmailContractAddress = chain.getContractAddressByName(CONTRACT_DMAIL);

    if (!dmailContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    return { dmailContractAddress };
  }

  async sendMail(account: Account, chain: Chain) {
    const { w3 } = chain;

    const { dmailContractAddress } = await this.checkIsAllowed(chain);

    const sendFunctionCall = await this.getSendCall({
      chain,
      dmailContractAddress,
    });

    const estimatedGas = await sendFunctionCall.estimateGas({
      from: account.address,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data: sendFunctionCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: dmailContractAddress,
      value: 0,
    };

    const transactionResult = await account.signAndSendTransaction(chain, tx);

    return transactionResult;
  }
}

export default DmailSendMail;
