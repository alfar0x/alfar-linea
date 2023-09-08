import Block from "../../core/block";
import Account from "../../core/account";
import Step from "../../core/step";

class Job {
  account: Account;
  blocks: Block[];
  currentSteps: Step[];

  constructor(account: Account, blocks: Block[]) {
    this.account = account;
    this.blocks = blocks;
    this.currentSteps = [];
  }

  private getNextBlockSteps() {
    const nextBlockSteps = this.blocks.shift();

    if (!nextBlockSteps) return [];

    return nextBlockSteps.allSteps(this.account);
  }

  isEmpty() {
    return !this.blocks.length && !this.currentSteps.length;
  }

  nextStep(): Step | null {
    const nextStep = this.currentSteps.shift();

    if (nextStep) return nextStep;

    const length = this.setNextCurrentSteps();

    if (!length) return null;

    return this.nextStep();
  }

  toString() {
    const blocksStr = this.blocks.map(String).join(", ");
    return `${String(this.account)} - [${blocksStr}]`;
  }

  isEquals(job: Job) {
    return this.account.isEquals(job.account);
  }

  setNextCurrentSteps() {
    this.currentSteps = this.getNextBlockSteps();

    return this.currentSteps.length;
  }
}

export default Job;
