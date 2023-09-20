class Step {
  public name: string;

  constructor(params: { name: string }) {
    const { name } = params;
    this.name = name;
  }

  // public equals(step: Step) {
  //   return this.name === step.name;
  // }

  public toString() {
    return this.name;
  }

  // private getFullMsg(account: Account, msg: string) {
  //   return [account, this.name, msg].join(" | ");
  // }

  // protected getLogger(account: Account) {
  //   return {
  //     info: (msg: string) => logger.info(this.getFullMsg(account, msg)),
  //     error: (msg: string) => logger.error(this.getFullMsg(account, msg)),
  //     debug: (msg: string) => logger.debug(this.getFullMsg(account, msg)),
  //   };
  // }

  // protected createDefaultStepName(name: string) {
  //   return `${this.name}-${name}`;
  // }
}

export default Step;
