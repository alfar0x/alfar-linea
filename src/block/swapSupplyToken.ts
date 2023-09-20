import Account from "../core/account";
import Block from "../core/block";
import SupplyStep from "../step/supply";
import SwapStep from "../step/swap";
import randomChoice from "../utils/random/randomChoice";

type PossibleWay = {
  buySwapStep: SwapStep;
  supplyStep: SupplyStep;
  sellSwapStep: SwapStep;
};

class SwapSupplyTokenBlock extends Block {
  private possibleWays: PossibleWay[];
  description = "swap eth -> token -> supply -> redeem -> eth";

  constructor(params: {
    swapSteps: SwapStep[];
    supplySteps: SupplyStep[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const {
      swapSteps,
      supplySteps,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleWays = this.initializePossibleWays(swapSteps, supplySteps);
  }

  private initializePossibleWays(
    swapSteps: SwapStep[],
    supplySteps: SupplyStep[],
  ) {
    const possibleWays = supplySteps.reduce((acc, supplyStep) => {
      if (supplyStep.token.isNative) return acc;

      const waysToBuyAndSellToken = swapSteps.reduce((acc, buySwapStep) => {
        if (!buySwapStep.fromToken.isNative) return acc;

        if (!buySwapStep.toToken.isEquals(supplyStep.token)) return acc;

        const sellPossibleWays = swapSteps.filter((sellSwapStep) =>
          buySwapStep.toToken.isEquals(sellSwapStep.fromToken),
        );

        const directions = sellPossibleWays.map((sellSwapStep) => ({
          buySwapStep,
          supplyStep,
          sellSwapStep,
        }));

        return [...acc, ...directions];
      }, [] as PossibleWay[]);

      return [...acc, ...waysToBuyAndSellToken];
    }, [] as PossibleWay[]);

    return possibleWays;
  }

  possibleWaysStrings() {
    return this.possibleWays
      .map(
        (possibleWay) =>
          `${possibleWay.buySwapStep} -> ${possibleWay.supplyStep} -> ${possibleWay.sellSwapStep}`,
      )
      .sort();
  }

  count() {
    return this.possibleWays.length;
  }

  async generateTransactions(params: { account: Account }) {
    const { account } = params;

    const { buySwapStep, supplyStep, sellSwapStep } = randomChoice(
      this.possibleWays,
    );

    const buyTransactions = await buySwapStep.swapPercentTransactions({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    const supplyTransactions = await supplyStep.supplyBalanceTransactions({
      account,
    });

    const redeemAllTransactions = await supplyStep.redeemAllTransactions({
      account,
    });

    const sellTransactions = await sellSwapStep.swapBalanceTransactions({
      account,
    });

    return [
      ...buyTransactions,
      ...supplyTransactions,
      ...redeemAllTransactions,
      ...sellTransactions,
    ];
  }
}

export default SwapSupplyTokenBlock;
