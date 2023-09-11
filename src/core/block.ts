import logger from "../utils/other/logger";

import Account from "./account";
import Chain from "./chain";

class Block {
  public name: string;
  protected chain: Chain;

  constructor(params: { name: string; chain: Chain }) {
    const { name, chain } = params;
    this.name = name;
    this.chain = chain;
  }

  public equals(block: Block) {
    return this.name === block.name;
  }

  public toString() {
    return this.name;
  }

  private getFullMsg(account: Account, msg: string) {
    return [account, this.name, msg].join(" | ");
  }

  protected getLogger(account: Account) {
    return {
      info: (msg: string) => logger.info(this.getFullMsg(account, msg)),
      error: (msg: string) => logger.error(this.getFullMsg(account, msg)),
      debug: (msg: string) => logger.debug(this.getFullMsg(account, msg)),
    };
  }

  protected createDefaultStepName(name: string) {
    return `${this.name}-${name}`;
  }
}

export default Block;
