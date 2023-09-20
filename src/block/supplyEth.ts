import Account from "../core/account";
import Block from "../core/block";
import SupplyStep from "../step/supply";
import randomChoice from "../utils/random/randomChoice";

type PossibleWay = SupplyStep;

class SupplyEthBlock extends Block {
  private possibleWays: PossibleWay[];
  description = "supply -> redeem eth";

  constructor(params: {
    supplySteps: SupplyStep[];
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { supplySteps, minWorkAmountPercent, maxWorkAmountPercent } = params;

    super({ minWorkAmountPercent, maxWorkAmountPercent });

    this.possibleWays = this.initializePossibleWays(supplySteps);
  }

  initializePossibleWays(supplySteps: SupplyStep[]) {
    return supplySteps.filter((supplyStep) => supplyStep.token.isNative);
  }

  possibleWaysStrings() {
    return this.possibleWays.map((possibleWay) => `${possibleWay}`).sort();
  }

  count() {
    return this.possibleWays.length;
  }

  async generateTransactions(params: { account: Account }) {
    const { account } = params;

    const supplyBlock = randomChoice(this.possibleWays);

    const supplyTransactions = await supplyBlock.supplyPercentTransactions({
      account,
      minWorkAmountPercent: this.minWorkAmountPercent,
      maxWorkAmountPercent: this.maxWorkAmountPercent,
    });

    const redeemTransactions = await supplyBlock.redeemAllTransactions({
      account,
    });

    return [...supplyTransactions, ...redeemTransactions];
  }
}

export default SupplyEthBlock;
