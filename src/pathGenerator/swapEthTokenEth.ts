import SwapBlock from "../block/swap";
import Account from "../core/account";
import PathGenerator from "../core/pathGenerator";
import randomChoice from "../utils/random/randomChoice";

type PossibleWay = {
  buySwapBlock: SwapBlock;
  sellSwapBlock: SwapBlock;
};

class SwapEthTokenEthPathGenerator extends PathGenerator {
  private possibleWays: PossibleWay[];
  description = "Swap eth -> token -> eth";

  constructor(params: { swapBlocks: SwapBlock[] }) {
    const { swapBlocks } = params;
    super();
    this.possibleWays = this.initializePossibleWays(swapBlocks);
  }

  private initializePossibleWays(swapBlocks: SwapBlock[]) {
    const possibleWays = swapBlocks.reduce((acc, buySwapBlock) => {
      if (!buySwapBlock.fromToken.isNative) return acc;

      const sellPossibleWays = swapBlocks.filter((sellSwapBlock) => {
        return buySwapBlock.toToken.isEquals(sellSwapBlock.fromToken);
      });

      const directions = sellPossibleWays.map((sellSwapBlock) => {
        return { buySwapBlock, sellSwapBlock };
      });

      return [...acc, ...directions];
    }, [] as PossibleWay[]);
    return possibleWays;
  }

  possibleWaysStrings() {
    return this.possibleWays
      .map(
        (possibleWay) =>
          `${possibleWay.buySwapBlock} -> ${possibleWay.sellSwapBlock}`,
      )
      .sort();
  }

  count() {
    return this.possibleWays.length;
  }

  async generateSteps(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { account, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const { buySwapBlock, sellSwapBlock } = randomChoice(this.possibleWays);

    const buySteps = await buySwapBlock.swapPercentSteps({
      account,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    const sellSteps = await sellSwapBlock.swapBalanceSteps({ account });

    return [...buySteps, ...sellSteps];
  }
}

export default SwapEthTokenEthPathGenerator;
