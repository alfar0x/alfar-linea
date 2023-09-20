import Account from "../../core/account";
import SupplyAction from "../../core/action/supply";
import Step from "../../core/step";
import Token from "../../core/token";

class SupplyStep extends Step {
  private action: SupplyAction;
  public token: Token;

  constructor(params: { action: SupplyAction; token: Token }) {
    const { action, token } = params;

    const name = `${action.name}_${token}`;

    super({ name });

    this.action = action;
    this.token = token;
  }

  async supplyBalanceTransactions(params: { account: Account }) {
    const { account } = params;

    const normalizedAmount = await this.token.normalizedBalanceOf(
      account.address,
    );

    const { txs } = await this.action.supply({
      account,
      token: this.token,
      normalizedAmount,
    });

    return txs;
  }

  async supplyPercentTransactions(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { account, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
      this.token,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    );

    const { txs } = await this.action.supply({
      account,
      token: this.token,
      normalizedAmount,
    });

    return txs;
  }

  async redeemAllTransactions(params: { account: Account }) {
    const { account } = params;

    const { txs } = await this.action.redeemAll({
      account,
      token: this.token,
    });

    return txs;
  }
}

export default SupplyStep;
