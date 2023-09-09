import Account from "../../core/account";
import Block from "../../core/block";
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

    if (!nextBlockSteps) return null;

    return nextBlockSteps.allSteps(this.account);
  }

  isEmpty() {
    return !this.blocks.length && !this.currentSteps.length;
  }

  nextStep(): Step | null {
    const nextStep = this.currentSteps.shift();

    if (nextStep) return nextStep;

    const isSet = this.setNextCurrentSteps();

    if (!isSet) return null;

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
    const nextBlockStep = this.getNextBlockSteps();

    if (!nextBlockStep) return false;

    this.currentSteps = nextBlockStep;

    return true;
  }
}

export default Job;
