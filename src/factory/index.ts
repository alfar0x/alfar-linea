import Big from "big.js";

import RandomBlock from "../block/random/base";
import SupplyBlock from "../block/supply";
import SwapBlock from "../block/swap";
import Account from "../core/account";
import Step from "../core/step";
import RandomPathGenerator from "../pathGenerator/random";
import SupplyEthPathGenerator from "../pathGenerator/supplyEth";
import SwapEthTokenEthPathGenerator from "../pathGenerator/swapEthTokenEth";
import randomChoice from "../utils/random/randomChoice";

type Generator = "SWAP_ETH_TOKEN_ETH" | "SUPPLY_ETH" | "RANDOM";

const TEMPORARY_RANDOM_STEPS_COUNT_MULTIPLIER = 5;

class Factory {
  /*
  otherPaths: OtherPath[]; 
  can request some token (or not) but it is not popular action so it doesn't 
  have own Path class to randomize it. Some game with usdc for example 
  */

  private swapEthToTokenPath: SwapEthTokenEthPathGenerator;
  private supplyEthPath: SupplyEthPathGenerator;
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
    this.randomBlockPath = new RandomPathGenerator({ randomBlocks });

    this.generatorsWithWeights = {
      SWAP_ETH_TOKEN_ETH: this.swapEthToTokenPath.count(),
      SUPPLY_ETH: this.supplyEthPath.count(),
      RANDOM:
        this.randomBlockPath.count() * TEMPORARY_RANDOM_STEPS_COUNT_MULTIPLIER,
    };

    this.randomBlocks = randomBlocks;
    this.minWorkAmountPercent = minWorkAmountPercent;
    this.maxWorkAmountPercent = maxWorkAmountPercent;
  }

  private getRandomWeightedGenerator() {
    const generatorKeys = Object.keys(
      this.generatorsWithWeights
    ) as Generator[];

    const totalWeight = generatorKeys.reduce(
      (acc, key) => acc + this.generatorsWithWeights[key],
      0
    );

    let randomValue = Math.random() * totalWeight;

    for (const key of generatorKeys) {
      const weight = this.generatorsWithWeights[key];
      if (randomValue < weight) return key;

      randomValue -= weight;
    }

    return null;
  }

  private async generateRandomSteps(params: { account: Account }) {
    const { account } = params;

    const generator = this.getRandomWeightedGenerator();

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
      case "RANDOM": {
        return await this.randomBlockPath.generateSteps({
          account,
        });
      }
      default: {
        throw new Error(
          `Unexpected error. Random generator is not available: ${generator}`
        );
      }
    }
  }

  private shouldRandomStepsBeAdded() {
    const generatorKeys = Object.keys(
      this.generatorsWithWeights
    ) as Generator[];

    const totalWeight = generatorKeys.reduce(
      (acc, key) => acc + this.generatorsWithWeights[key],
      0
    );

    return Big(this.generatorsWithWeights.RANDOM)
      .div(totalWeight)
      .lte(Math.random());
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
}

export default Factory;
