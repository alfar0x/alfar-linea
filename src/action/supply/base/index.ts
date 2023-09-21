import Big from "big.js";

import Account from "../../../core/account";
import Action, {
  DefaultActionFunctionResult,
  Provider,
} from "../../../core/action";
import Step from "../../../core/step";
import Token from "../../../core/token";
import RunnableTransaction from "../../../core/transaction";
import { Amount } from "../../../types";

abstract class SupplyAction extends Action {
  public token: Token;

  public constructor(params: { token: Token }) {
    const { token } = params;

    super();

    this.token = token;
  }

  protected initializeName(params: { provider: Provider }) {
    const { provider } = params;
    this.initializeDefaultName({
      provider,
      actionType: "SUPPLY",
      operation: `${this.token}`,
    });
  }

  // eslint-disable-next-line no-unused-vars
  protected abstract approveSupply(params: {
    account: Account;
    normalizedAmount: Amount;
  }): Promise<DefaultActionFunctionResult>;

  // eslint-disable-next-line no-unused-vars
  protected abstract supply(params: {
    account: Account;
    normalizedAmount: Amount;
  }): Promise<DefaultActionFunctionResult>;

  // eslint-disable-next-line no-unused-vars
  protected abstract redeemAll(params: {
    account: Account;
  }): Promise<DefaultActionFunctionResult>;

  protected getContractAddress(params: { contractName: string }) {
    const { contractName } = params;

    return this.getDefaultContractAddress({
      contractName,
      chain: this.token.chain,
    });
  }

  protected async checkIsBalanceAllowed(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const normalizedBalance = await this.token.normalizedBalanceOf(
      account.address,
    );

    const isBalanceAllowed = Big(normalizedBalance).gte(normalizedAmount);

    if (isBalanceAllowed) return;

    const readableBalance =
      await this.token.toReadableAmount(normalizedBalance);

    const readableAmount = await this.token.toReadableAmount(normalizedAmount);

    throw new Error(
      `balance is less than amount: ${readableBalance} < ${readableAmount}`,
    );
  }

  public supplyAmountStep(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const step = new Step({ name: this.name });

    if (!this.token.isNative) {
      const createApproveTransaction = () =>
        this.approveSupply({
          account,
          normalizedAmount,
        });

      const approveTransaction = new RunnableTransaction({
        name: this.getTxName("approve"),
        chain: this.token.chain,
        account: account,
        createTransaction: createApproveTransaction,
      });

      step.push(approveTransaction);
    }

    const createSupplyTransaction = () =>
      this.supply({ account, normalizedAmount });

    const supplyTransaction = new RunnableTransaction({
      name: this.getTxName("supply"),
      chain: this.token.chain,
      account: account,
      createTransaction: createSupplyTransaction,
    });

    step.push(supplyTransaction);

    return step;
  }

  public async supplyBalanceStep(params: { account: Account }) {
    const { account } = params;

    const normalizedAmount = await this.token.normalizedBalanceOf(
      account.address,
    );

    return this.supplyAmountStep({ account, normalizedAmount });
  }

  public async supplyPercentStep(params: {
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

    return this.supplyAmountStep({ account, normalizedAmount });
  }

  public redeemAllStep(params: { account: Account }) {
    const { account } = params;

    const step = new Step({ name: this.name });

    const createRedeemAllTransaction = () => this.redeemAll({ account });

    const redeemAllTransaction = new RunnableTransaction({
      name: this.getTxName("REDEEM_ALL"),
      chain: this.token.chain,
      account: account,
      createTransaction: createRedeemAllTransaction,
    });

    step.push(redeemAllTransaction);

    return step;
  }

  protected async getDefaultSupplyResultMsg(params: {
    normalizedAmount: Amount;
  }) {
    const { normalizedAmount } = params;

    const readableAmount = await this.token.toReadableAmount(normalizedAmount);

    return `${readableAmount} ${this.token} supplied`;
  }

  protected async getDefaultRedeemResultMsg(params: {
    normalizedAmount?: Amount;
  }) {
    const { normalizedAmount } = params;

    if (normalizedAmount) {
      const readableAmount =
        await this.token.toReadableAmount(normalizedAmount);

      return `${readableAmount} ${this.token} redeemed`;
    }

    return `${this.token} redeemed`;
  }
}

export default SupplyAction;
