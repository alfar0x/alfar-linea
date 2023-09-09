import logger from "../utils/logger";
import Account from "./account";
import Step from "./step";
import Chain from "./chain";

abstract class Block {
  public abstract name: string;
  protected chain: Chain;

  constructor(params: { chain: Chain }) {
    const { chain } = params;

    this.chain = chain;
  }

  public equals(block: Block) {
    return this.name === block.name;
  }

  public toString() {
    return this.name;
  }

  // eslint-disable-next-line no-unused-vars
  abstract allSteps(account: Account): Step[];
  // eslint-disable-next-line no-unused-vars
  abstract resetSteps(account: Account): Step[];

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
