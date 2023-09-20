import Account from "../core/account";
import Block from "../core/block";
import RandomStep from "../step/random";
import randomChoice from "../utils/random/randomChoice";

type PossibleWay = RandomStep;

class RandomBlock extends Block {
  private possibleWays: PossibleWay[];
  private randomSteps: RandomStep[];

  description = "random";

  constructor(params: {
    randomSteps: RandomStep[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { randomSteps, minWorkAmountPercent, maxWorkAmountPercent } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.randomSteps = randomSteps;
    this.possibleWays = this.initializePossibleWays(randomSteps);
  }

  initializePossibleWays(randomSteps: RandomStep[]) {
    return randomSteps;
  }

  possibleWaysStrings() {
    return this.possibleWays.map((possibleWay) => `${possibleWay}`).sort();
  }

  count() {
    return this.possibleWays.length;
  }

  // eslint-disable-next-line require-await
  async generateTransactions(params: { account: Account }) {
    const { account } = params;

    const randomStep = randomChoice(this.possibleWays);

    return randomStep.allTransactions(account);
  }

  getRandomStep() {
    return randomChoice(this.randomSteps);
  }
}

export default RandomBlock;
