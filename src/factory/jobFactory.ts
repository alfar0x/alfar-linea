import Big from "big.js";

import RandomBlock from "../block/random/base";
import SupplyBlock from "../block/supply";
import SwapBlock from "../block/swap";
import Account from "../core/account";
import Step from "../core/step";
import RandomPathGenerator from "../pathGenerator/random";
import SupplyEthPathGenerator from "../pathGenerator/supplyEth";
import SwapEthTokenEthPathGenerator from "../pathGenerator/swapEthTokenEth";
import SwapSupplyTokenPathGenerator from "../pathGenerator/swapSupplyToken";
import randomChoice from "../utils/random/randomChoice";

type Generator =
  | "SWAP_ETH_TOKEN_ETH"
  | "SUPPLY_ETH"
  | "SWAP_SUPPLY_TOKEN"
  | "RANDOM";

class JobFactory {
  /*
  otherPath: OtherPathGenerator[]; 
  can request some token (or not) but it is not popular action so it doesn't 
  have own Path class to randomize it. Some game with usdc for example 
  */

  private swapEthToTokenPath: SwapEthTokenEthPathGenerator;
  private supplyEthPath: SupplyEthPathGenerator;
  private swapSupplyTokenPath: SwapSupplyTokenPathGenerator;
  private randomBlockPath: RandomPathGenerator;

  private randomBlocks: RandomBlock[];
  private generatorsWithWeights: Record<Generator, number>;

  private minWorkAmountPercent: number;
  private maxWorkAmountPercent: number;

  constructor(params: {
    swapBlocks: SwapBlock[];
    supplyBlocks: SupplyBlock[];
    randomBlocks: RandomBlock[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const {
      swapBlocks,
      supplyBlocks,
      randomBlocks,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    } = params;

    this.swapEthToTokenPath = new SwapEthTokenEthPathGenerator({ swapBlocks });
    this.supplyEthPath = new SupplyEthPathGenerator({ supplyBlocks });
    this.swapSupplyTokenPath = new SwapSupplyTokenPathGenerator({
      supplyBlocks,
      swapBlocks,
    });
    this.randomBlockPath = new RandomPathGenerator({ randomBlocks });

    this.generatorsWithWeights = this.initializedWights();
    this.randomBlocks = randomBlocks;
    this.minWorkAmountPercent = minWorkAmountPercent;
    this.maxWorkAmountPercent = maxWorkAmountPercent;
  }

  private initializedWights() {
    return {
      // @TODO temporary hardcoded
      SWAP_ETH_TOKEN_ETH: this.swapEthToTokenPath.count() ? 70 : 0,
      SUPPLY_ETH: this.supplyEthPath.count() ? 10 : 0,
      SWAP_SUPPLY_TOKEN: this.swapSupplyTokenPath.count() ? 10 : 0,
      RANDOM: this.randomBlockPath.count() ? 10 : 0,
    };
  }

  private getRandomWeightedItem() {
    const totalWeight = Object.values(this.generatorsWithWeights).reduce(
      (sum, weight) => sum + weight,
      0,
    );

    let randomValue = Math.random() * totalWeight;

    for (const [key, weight] of Object.entries(this.generatorsWithWeights)) {
      randomValue -= weight;
      if (randomValue <= 0) return key as Generator;
    }

    return null;
  }

  private async generateRandomSteps(params: { account: Account }) {
    const { account } = params;

    const generator = this.getRandomWeightedItem();

    switch (generator) {
      case "SWAP_ETH_TOKEN_ETH": {
        return await this.swapEthToTokenPath.generateSteps({
          account,
          minWorkAmountPercent: this.minWorkAmountPercent,
          maxWorkAmountPercent: this.maxWorkAmountPercent,
        });
      }
      case "SUPPLY_ETH": {
        return await this.supplyEthPath.generateSteps({
          account,
          minWorkAmountPercent: this.minWorkAmountPercent,
          maxWorkAmountPercent: this.maxWorkAmountPercent,
        });
      }
      case "SWAP_SUPPLY_TOKEN": {
        return await this.swapSupplyTokenPath.generateSteps({
          account,
          minWorkAmountPercent: this.minWorkAmountPercent,
          maxWorkAmountPercent: this.maxWorkAmountPercent,
        });
      }
      case "RANDOM": {
        return this.randomBlockPath.generateSteps({
          account,
        });
      }
      default: {
        throw new Error(
          `Unexpected error. Random generator is not available: ${generator}`,
        );
      }
    }
  }

  private shouldRandomStepsBeAdded() {
    const generatorKeys = Object.keys(
      this.generatorsWithWeights,
    ) as Generator[];

    const totalWeight = generatorKeys.reduce(
      (acc, key) => acc + this.generatorsWithWeights[key],
      0,
    );

    return Big(this.generatorsWithWeights.RANDOM)
      .div(totalWeight)
      .gte(Math.random());
  }

  private addRandomSteps(account: Account, steps: Step[]) {
    const randomBlock = randomChoice(this.randomBlocks);
    const randomBlockSteps = [...randomBlock.allSteps(account)];
    const newArray: (Step | Step[])[] = [...steps];
    const randomIndex = Math.floor(Math.random() * (newArray.length + 1));
    newArray.splice(randomIndex, 0, randomBlockSteps);
    return newArray.flat();
  }

  async getRandomSteps(params: { account: Account }) {
    const { account } = params;
    const steps = await this.generateRandomSteps({
      account,
    });

    const shouldRandomStepsBeAdded = this.shouldRandomStepsBeAdded();

    return shouldRandomStepsBeAdded
      ? this.addRandomSteps(account, steps)
      : steps;
  }

  infoString(isFull = false) {
    const generators = [
      this.swapEthToTokenPath,
      this.supplyEthPath,
      this.swapSupplyTokenPath,
      this.randomBlockPath,
    ];

    const generatorsInfo = generators.map((g) => {
      const short = `${g.description}: ${g.count()}`;

      if (!isFull) return short;

      const possibleWaysStrings = g.possibleWaysStrings().join("\n");

      return `${short}\n${possibleWaysStrings}\n`;
    });

    const msg = [`Possible ways:`, ...generatorsInfo];

    return msg.join("\n");
  }
}

export default JobFactory;
