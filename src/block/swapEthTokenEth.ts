import Account from "../core/account";
import Block from "../core/block";
import SwapStep from "../step/swap";
import randomChoice from "../utils/random/randomChoice";

type PossibleWay = {
  buySwapStep: SwapStep;
  sellSwapStep: SwapStep;
};

class SwapEthTokenEthBlock extends Block {
  private possibleWays: PossibleWay[];
  description = "swap eth -> token -> eth";

  constructor(params: {
    swapSteps: SwapStep[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { swapSteps, minWorkAmountPercent, maxWorkAmountPercent } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleWays = this.initializePossibleWays(swapSteps);
  }

  private initializePossibleWays(swapSteps: SwapStep[]) {
    const possibleWays = swapSteps.reduce((acc, buySwapStep) => {
      if (!buySwapStep.fromToken.isNative) return acc;

      const sellPossibleWays = swapSteps.filter((sellSwapStep) =>
        buySwapStep.toToken.isEquals(sellSwapStep.fromToken),
      );

      const directions = sellPossibleWays.map((sellSwapStep) => ({
        buySwapStep,
        sellSwapStep,
      }));

      return [...acc, ...directions];
    }, [] as PossibleWay[]);
    return possibleWays;
  }

  possibleWaysStrings() {
    return this.possibleWays
      .map(
        (possibleWay) =>
          `${possibleWay.buySwapStep} -> ${possibleWay.sellSwapStep}`,
      )
      .sort();
  }

  count() {
    return this.possibleWays.length;
  }

  async generateTransactions(params: { account: Account }) {
    const { account } = params;

    const { buySwapStep, sellSwapStep } = randomChoice(this.possibleWays);

    const buyTransactions = await buySwapStep.swapPercentTransactions({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    const sellTransactions = await sellSwapStep.swapBalanceTransactions({
      account,
    });

    return [...buyTransactions, ...sellTransactions];
  }
}

export default SwapEthTokenEthBlock;
