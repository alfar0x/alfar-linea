import Big from "big.js";

import LineaBankSupply from "../../action/lineaBankSupply";
import Account from "../../core/account";
import Block from "../../core/block";
import Step from "../../core/step";
import Token from "../../core/token";
import Transaction from "../../core/transaction";

class BaseLineaBankSupply extends Block {
  name = "";
  minWorkAmountPercent: number;
  maxWorkAmountPercent: number;
  token: Token;

  constructor(params: {
    token: Token;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
  }) {
    const { token, minWorkAmountPercent, maxWorkAmountPercent } = params;

    super({ chain: token.chain });

    this.minWorkAmountPercent = minWorkAmountPercent;
    this.maxWorkAmountPercent = maxWorkAmountPercent;
    this.token = token;
  }

  async supply(account: Account) {
    const logger = this.getLogger(account);

    const randomNormalizedAmount =
      await account.getRandomNormalizedAmountOfBalance(
        this.token,
        this.minWorkAmountPercent,
        this.maxWorkAmountPercent
      );

    const lineaBank = new LineaBankSupply();

    const { hash, inReadableAmount } = await lineaBank.supply({
      account,
      token: this.token,
      normalizedAmount: randomNormalizedAmount,
    });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `supply ${inReadableAmount} ${this.token} success: ${hashLink}`
    );

    return true;
  }

  async approve(account: Account) {
    const logger = this.getLogger(account);

    logger.debug("start approve");

    const lineaBank = new LineaBankSupply();

    const contractAddress = lineaBank.getAddressToApprove(this.chain);

    if (!contractAddress) {
      throw new Error(
        `Contract address of lineaBank for ${this.chain} is not found`
      );
    }

    const normalizedBalance = await this.token.normalizedBalanceOf(
      account.address
    );

    const hash = await this.token.approve(
      account,
      contractAddress,
      Big(normalizedBalance).plus(1).toString()
    );

    const readableBalance = await this.token.toReadableAmount(
      normalizedBalance
    );

    if (!hash) {
      logger.info(`already approved ${readableBalance} ${this.token}`);
      return false;
    }

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `approve ${readableBalance} ${this.token} success: ${hashLink}`
    );

    return true;
  }

  async redeem(account: Account) {
    const logger = this.getLogger(account);

    const lineaBank = new LineaBankSupply();

    const { hash, outReadableAmount } = await lineaBank.redeemAll({
      account,
      token: this.token,
    });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `redeem ${outReadableAmount} ${this.token} success: ${hashLink}`
    );

    return true;
  }

  startSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`getting start steps`);

    const step = new Step({
      name: this.createDefaultStepName("start"),
      transactions: [],
    });

    if (!this.token.isNative) {
      const approveTransaction = new Transaction({
        name: step.createDefaultTransactionName("approve"),
        fn: () => this.approve(account),
      });
      step.push(approveTransaction);
    }

    const supplyTransaction = new Transaction({
      name: step.createDefaultTransactionName("supply"),
      fn: () => this.supply(account),
    });
    step.push(supplyTransaction);

    return [step];
  }

  allSteps(account: Account) {
    const startSupplySteps = this.startSteps(account);
    const resetSupplySteps = this.resetSteps(account);
    return [...startSupplySteps, ...resetSupplySteps];
  }

  resetSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`getting reset steps`);

    const step = new Step({
      name: this.createDefaultStepName("reset"),
      transactions: [],
    });

    const redeemTransaction = new Transaction({
      name: step.createDefaultTransactionName("redeem"),
      fn: () => this.redeem(account),
    });
    step.push(redeemTransaction);

    return [step];
  }
}

export default BaseLineaBankSupply;
