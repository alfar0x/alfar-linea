import Big from "big.js";

import Account from "../../../core/account";
import Action, {
  DefaultActionFunctionResult,
  ActionProvider,
} from "../../../core/action";
import Step from "../../../core/step";
import Token from "../../../core/token";
import RunnableTransaction from "../../../core/transaction";
import { Amount } from "../../../types";
import randomInteger from "../../../utils/random/randomInteger";
import ActionContext from "../../../core/actionContext";

export type SwapActionConstructorParams = {
  fromToken: Token;
  toToken: Token;
};

abstract class SwapAction extends Action {
  public readonly fromToken: Token;
  public readonly toToken: Token;

  protected constructor(params: {
    fromToken: Token;
    toToken: Token;
    provider: ActionProvider;
    context: ActionContext;
  }) {
    const { fromToken, toToken, provider, context } = params;

    SwapAction.checkPair(fromToken, toToken);

    super({
      actionType: "SWAP",
      operation: `${fromToken}_${toToken}`,
      provider,
      context,
    });

    this.fromToken = fromToken;
    this.toToken = toToken;
  }

  // eslint-disable-next-line no-unused-vars
  protected abstract approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }): Promise<DefaultActionFunctionResult>;

  // eslint-disable-next-line no-unused-vars
  protected abstract swap(params: {
    account: Account;
    normalizedAmount: Amount;
  }): Promise<DefaultActionFunctionResult>;

  private static checkPair(fromToken: Token, toToken: Token) {
    const isSameTokens = fromToken.isEquals(toToken);

    if (isSameTokens) {
      throw new Error(`swap is not available for equal tokens`);
    }

    const isSameChains = fromToken.chain.isEquals(toToken.chain);

    if (!isSameChains) {
      throw new Error(`swap is not available for tokens in different chains`);
    }
  }

  protected getContractAddress(params: { contractName: string }) {
    const { contractName } = params;

    return SwapAction.getDefaultContractAddress({
      contractName,
      chain: this.fromToken.chain,
    });
  }

  protected async checkIsBalanceAllowed(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const normalizedBalance = await this.fromToken.normalizedBalanceOf(
      account.address,
    );

    const isBalanceAllowed = Big(normalizedBalance).gte(normalizedAmount);

    if (isBalanceAllowed) return;

    const readableBalance =
      await this.fromToken.toReadableAmount(normalizedBalance);

    const readableAmount =
      await this.fromToken.toReadableAmount(normalizedAmount);

    throw new Error(
      `balance is less than amount: ${readableBalance} < ${readableAmount}`,
    );
  }

  private getCreateApproveTransaction(params: { account: Account }) {
    const { account } = params;

    const createApproveTransaction = async () => {
      const {
        minWorkAmountPercent,
        maxWorkAmountPercent,
        minApproveMultiplier,
        maxApproveMultiplier,
      } = this.context;

      const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
        this.fromToken,
        minWorkAmountPercent,
        maxWorkAmountPercent,
      );

      const minAmount = Big(normalizedAmount).times(minApproveMultiplier);
      const maxAmount = Big(normalizedAmount).times(maxApproveMultiplier);

      const randomNormalizedAmount = randomInteger(
        minAmount,
        maxAmount,
      ).toString();

      return this.approve({
        account,
        normalizedAmount: randomNormalizedAmount,
      });
    };

    return createApproveTransaction;
  }

  private getCreateSwapTransaction(params: {
    account: Account;
    isAllBalance?: boolean;
  }) {
    const { account, isAllBalance } = params;

    const createSwapTransaction = async () => {
      const { minWorkAmountPercent, maxWorkAmountPercent } = this.context;

      const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
        this.fromToken,
        isAllBalance ? minWorkAmountPercent : 100,
        isAllBalance ? maxWorkAmountPercent : 100,
      );
      return await this.swap({ account, normalizedAmount });
    };

    return createSwapTransaction;
  }

  public swapStep(params: { account: Account; isAllBalance?: boolean }) {
    const { account, isAllBalance } = params;

    const step = new Step({ name: this.name });

    if (!this.fromToken.isNative) {
      const createTransaction = this.getCreateApproveTransaction({ account });

      const approveTransaction = new RunnableTransaction({
        name: this.getTxName("approve"),
        chain: this.fromToken.chain,
        account: account,
        createTransaction,
      });

      step.push(approveTransaction);
    }

    const createTransaction = this.getCreateSwapTransaction({
      account,
      isAllBalance,
    });

    const swapTransaction = new RunnableTransaction({
      name: this.getTxName("swap"),
      chain: this.fromToken.chain,
      account: account,
      createTransaction,
    });

    step.push(swapTransaction);

    return step;
  }

  protected async getDefaultSwapResultMsg(params: {
    normalizedAmount: Amount;
    minOutNormalizedAmount: Amount;
  }) {
    const { normalizedAmount, minOutNormalizedAmount } = params;

    const inReadableAmount =
      await this.fromToken.toReadableAmount(normalizedAmount);

    const outReadableAmount = await this.toToken.toReadableAmount(
      minOutNormalizedAmount,
    );
    return `${inReadableAmount} ${this.fromToken} -> ${outReadableAmount} ${this.toToken} swapped`;
  }
}

export default SwapAction;
