import RandomBlock from "../block/random/base";
import Account from "../core/account";
import PathGenerator from "../core/pathGenerator";
import randomChoice from "../utils/random/randomChoice";

type PossibleWay = RandomBlock;

class RandomPathGenerator extends PathGenerator {
  private possibleWays: PossibleWay[];
  description = "Random blocks";

  constructor(params: { randomBlocks: RandomBlock[] }) {
    const { randomBlocks } = params;
    super();
    this.possibleWays = this.initializePossibleWays(randomBlocks);
  }

  initializePossibleWays(randomBlocks: RandomBlock[]) {
    return randomBlocks;
  }

  possibleWaysStrings() {
    return this.possibleWays.map((possibleWay) => `${possibleWay}`).sort();
  }

  count() {
    return this.possibleWays.length;
  }

  async generateSteps(params: { account: Account }) {
    const { account } = params;

    const randomBlock = randomChoice(this.possibleWays);

    return randomBlock.allSteps(account);
  }
}

export default RandomPathGenerator;
