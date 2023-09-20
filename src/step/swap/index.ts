import Account from "../../core/account";
import SwapAction from "../../core/action/swap";
import Step from "../../core/step";
import Token from "../../core/token";

class SwapStep extends Step {
  private action: SwapAction;
  fromToken: Token;
  toToken: Token;

  constructor(params: {
    action: SwapAction;
    fromToken: Token;
    toToken: Token;
  }) {
    const { action, fromToken, toToken } = params;

    const name = `${action.name}_${fromToken}_${toToken}`;

    super({ name });
    this.action = action;
    this.fromToken = fromToken;
    this.toToken = toToken;
  }

  async swapBalanceTransactions(params: { account: Account }) {
    const { account } = params;

    const normalizedAmount = await this.fromToken.normalizedBalanceOf(
      account.address,
    );

    const { txs } = await this.action.swap({
      account,
      fromToken: this.fromToken,
      toToken: this.toToken,
      normalizedAmount,
    });

    return txs;
  }

  async swapPercentTransactions(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { account, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
      this.fromToken,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    );

    const { txs } = await this.action.swap({
      account,
      fromToken: this.fromToken,
      toToken: this.toToken,
      normalizedAmount,
    });

    return txs;
  }
}

export default SwapStep;
