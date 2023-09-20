import Big from "big.js";

import RandomBlock from "../block/random";
import SupplyEthBlock from "../block/supplyEth";
import SwapEthTokenEthBlock from "../block/swapEthTokenEth";
import SwapSupplyTokenBlock from "../block/swapSupplyToken";
import Account from "../core/account";
import Block from "../core/block";
import RunnableTransaction from "../core/transaction";
import RandomStep from "../step/random";
import SupplyStep from "../step/supply";
import SwapStep from "../step/swap";

type BlockId =
  | "SWAP_ETH_TOKEN_ETH"
  | "SUPPLY_ETH"
  | "SWAP_SUPPLY_TOKEN"
  | "RANDOM";

class JobFactory {
  private swapEthTokenEthBlock: SwapEthTokenEthBlock;
  private supplyEthBlock: SupplyEthBlock;
  private swapSupplyTokenBlock: SwapSupplyTokenBlock;
  private randomBlock: RandomBlock;

  private blocksData: Record<BlockId, { block: Block; weight: number }>;

  constructor(params: {
    swapSteps: SwapStep[];
    supplySteps: SupplyStep[];
    randomSteps: RandomStep[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const {
      swapSteps,
      supplySteps,
      randomSteps,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    } = params;

    this.swapEthTokenEthBlock = new SwapEthTokenEthBlock({
      swapSteps,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.supplyEthBlock = new SupplyEthBlock({
      supplySteps,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.swapSupplyTokenBlock = new SwapSupplyTokenBlock({
      supplySteps,
      swapSteps,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.randomBlock = new RandomBlock({
      randomSteps,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    this.blocksData = this.initializedWeights();
  }

  private initializedWeights() {
    return {
      // @TODO temporary hardcoded
      SWAP_ETH_TOKEN_ETH: {
        block: this.swapEthTokenEthBlock,
        weight: this.swapEthTokenEthBlock.count() ? 70 : 0,
      },
      SUPPLY_ETH: {
        block: this.supplyEthBlock,
        weight: this.supplyEthBlock.count() ? 10 : 0,
      },
      SWAP_SUPPLY_TOKEN: {
        block: this.swapSupplyTokenBlock,
        weight: this.swapSupplyTokenBlock.count() ? 10 : 0,
      },
      RANDOM: {
        block: this.randomBlock,
        weight: this.randomBlock.count() ? 10 : 0,
      },
    };
  }

  private getTotalBlocksWeight() {
    return Object.values(this.blocksData).reduce(
      (sum, { weight }) => sum + weight,
      0,
    );
  }

  private getRandomWeightedBlock() {
    const totalWeight = this.getTotalBlocksWeight();

    let randomValue = Math.random() * totalWeight;

    for (const { block, weight } of Object.values(this.blocksData)) {
      randomValue -= weight;

      if (randomValue <= 0) return block;
    }

    return null;
  }

  private async generateRandomSteps(params: { account: Account }) {
    const { account } = params;

    const block = this.getRandomWeightedBlock();

    if (!block) {
      throw new Error(
        `Unexpected error. Random generator is not available: ${block}`,
      );
    }

    return await block.generateTransactions({
      account,
    });
  }

  private shouldRandomTransactionsBeAdded() {
    const totalWeight = this.getTotalBlocksWeight();

    return Big(this.blocksData.RANDOM.weight)
      .div(totalWeight)
      .gte(Math.random());
  }

  private addRandomTransactions(account: Account, txs: RunnableTransaction[]) {
    const randomBlock = this.randomBlock.getRandomStep();

    const randomIdx = Math.floor(Math.random() * (txs.length + 1));

    const firstPart = txs.slice(0, randomIdx);
    const secondPart = txs.slice(randomIdx);

    return [
      ...firstPart,
      ...randomBlock.allTransactions(account),
      ...secondPart,
    ];
  }

  async getRandomTransactions(params: { account: Account }) {
    const { account } = params;
    const steps = await this.generateRandomSteps({
      account,
    });

    return this.shouldRandomTransactionsBeAdded()
      ? this.addRandomTransactions(account, steps)
      : steps;
  }

  infoString(isFull = false) {
    const generatorsInfo = Object.values(this.blocksData).map(({ block }) => {
      const short = `${block.description}: ${block.count()}`;

      if (!isFull) return short;

      const possibleWaysStrings = block.possibleWaysStrings().join("\n");

      return `${short}\n${possibleWaysStrings}\n`;
    });

    const msg = [`Possible ways:`, ...generatorsInfo];

    return msg.join("\n");
  }
}

export default JobFactory;
