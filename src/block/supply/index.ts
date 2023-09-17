import Account from "../../core/account";
import { SupplyAction } from "../../core/action/supply";
import Block from "../../core/block";
import Chain from "../../core/chain";
import Step from "../../core/step";
import Token from "../../core/token";
import Transaction from "../../core/transaction";
import { Amount } from "../../types";

class SupplyBlock extends Block {
  private action: SupplyAction;
  token: Token;

  constructor(params: { action: SupplyAction; chain: Chain; token: string }) {
    const { action, chain, token } = params;
    const name = `${action.name}_${token}`;
    super({ name, chain });
    this.action = action;
    this.token = chain.getTokenByName(token);
  }

  private async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const logger = this.getLogger(account);

    logger.debug("start approve");

    if (this.token.isNative) return true;

    const contractAddress = this.action.getApproveAddress(
      this.chain,
      this.token,
    );

    if (!contractAddress) {
      throw new Error(
        `Contract address of ${this.action} for ${this.chain} is not found`,
      );
    }

    const hash = await this.token.approve(
      account,
      contractAddress,
      normalizedAmount,
    );

    const readableAmount = await this.token.toReadableAmount(normalizedAmount);

    if (!hash) {
      logger.info(`already approved ${readableAmount} ${this.token}`);
      return false;
    }

    const hashLink = this.chain.getHashLink(hash);

    logger.info(`approve ${readableAmount} ${this.token} success: ${hashLink}`);

    return true;
  }

  private async supply(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;
    const logger = this.getLogger(account);

    const { hash, inReadableAmount } = await this.action.supply({
      account,
      token: this.token,
      normalizedAmount,
    });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `supply ${inReadableAmount} ${this.token} success: ${hashLink}`,
    );

    return true;
  }

  private async redeemAll(params: { account: Account }) {
    const { account } = params;
    const logger = this.getLogger(account);

    const { hash, outReadableAmount } = await this.action.redeemAll({
      account,
      token: this.token,
    });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `redeem ${outReadableAmount} ${this.token} success: ${hashLink}`,
    );

    return true;
  }

  private supplySteps(params: {
    namePrefix: string;
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { namePrefix, account, normalizedAmount } = params;

    const step = new Step({
      name: this.createDefaultStepName(`SUPPLY_${namePrefix}`),
      transactions: [],
    });

    const approveTransaction = new Transaction({
      name: step.createDefaultTransactionName(`APPROVE`),
      fn: () => this.approve({ account, normalizedAmount }),
    });
    step.push(approveTransaction);

    const supplyTransaction = new Transaction({
      name: step.createDefaultTransactionName(`SUPPLY`),
      fn: () => this.supply({ account, normalizedAmount }),
    });

    step.push(supplyTransaction);

    return [step];
  }

  async supplyBalanceSteps(params: { account: Account }) {
    const { account } = params;

    const normalizedAmount = await this.token.normalizedBalanceOf(
      account.address,
    );

    return this.supplySteps({
      namePrefix: "BALANCE",
      account,
      normalizedAmount,
    });
  }

  async supplyPercentSteps(params: {
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

    return this.supplySteps({
      namePrefix: "PERCENT",
      account,
      normalizedAmount,
    });
  }

  async redeemAllSteps(params: { account: Account }) {
    const { account } = params;

    const step = new Step({
      name: this.createDefaultStepName("REDEEM_ALL"),
      transactions: [],
    });

    const redeemAllTransaction = new Transaction({
      name: step.createDefaultTransactionName("REDEEM_ALL"),
      fn: () => this.redeemAll({ account }),
    });

    step.push(redeemAllTransaction);

    return [step];
  }
}

export default SupplyBlock;
