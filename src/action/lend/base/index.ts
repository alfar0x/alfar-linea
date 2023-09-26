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
import randomInteger from "../../../utils/random/randomInteger";

abstract class LendAction extends Action {
  public readonly token: Token;

  public constructor(params: { token: Token }) {
    const { token } = params;

    super();

    this.token = token;
  }

  protected initializeName(params: { provider: Provider }) {
    const { provider } = params;
    this.initializeDefaultName({
      provider,
      actionType: "LEND",
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

    return LendAction.getDefaultContractAddress({
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

  private getCreateApproveTransaction(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }) {
    const {
      account,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    } = params;

    const createApproveSupplyTransaction = async () => {
      const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
        this.token,
        minWorkAmountPercent,
        maxWorkAmountPercent,
      );

      const minAmount = Big(normalizedAmount).times(minApproveMultiplier);
      const maxAmount = Big(normalizedAmount).times(maxApproveMultiplier);

      const randomNormalizedAmount = randomInteger(
        minAmount,
        maxAmount,
      ).toString();

      return this.approveSupply({
        account,
        normalizedAmount: randomNormalizedAmount,
      });
    };

    return createApproveSupplyTransaction;
  }

  private getCreateSupplyTransaction(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { account, minWorkAmountPercent, maxWorkAmountPercent } = params;

    const createSupplyTransaction = async () => {
      const normalizedAmount = await account.getRandomNormalizedAmountOfBalance(
        this.token,
        minWorkAmountPercent,
        maxWorkAmountPercent,
      );
      return await this.supply({ account, normalizedAmount });
    };

    return createSupplyTransaction;
  }

  public supplyStep(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }) {
    const {
      account,
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    } = params;

    const step = new Step({ name: `${this.name}_SUPPLY` });

    if (!this.token.isNative) {
      const createTransaction = this.getCreateApproveTransaction({
        account,
        minWorkAmountPercent,
        maxWorkAmountPercent,
        minApproveMultiplier,
        maxApproveMultiplier,
      });

      const approveTransaction = new RunnableTransaction({
        name: this.getTxName("approve"),
        chain: this.token.chain,
        account: account,
        createTransaction,
      });

      step.push(approveTransaction);
    }

    const createTransaction = this.getCreateSupplyTransaction({
      account,
      minWorkAmountPercent,
      maxWorkAmountPercent,
    });

    const supplyTransaction = new RunnableTransaction({
      name: this.getTxName("supply"),
      chain: this.token.chain,
      account: account,
      createTransaction,
    });

    step.push(supplyTransaction);

    return step;
  }

  public getCreateRedeemAllTransaction = (params: { account: Account }) => {
    const { account } = params;
    return async () => {
      return await this.redeemAll({ account });
    };
  };

  public redeemAllStep(params: { account: Account }) {
    const { account } = params;

    const step = new Step({ name: `${this.name}_REDEEM_ALL` });

    const createTransaction = this.getCreateRedeemAllTransaction({ account });

    const redeemAllTransaction = new RunnableTransaction({
      name: this.getTxName("redeem-all"),
      chain: this.token.chain,
      account: account,
      createTransaction,
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

export default LendAction;
