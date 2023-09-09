import Big from "big.js";

import OpenOceanExchange from "../../action/openOceanExchange";
import Account from "../../core/account";
import Block from "../../core/block";
import Step from "../../core/step";
import Token from "../../core/token";
import Transaction from "../../core/transaction";

class BaseOpenOceanEthToTokenSwap extends Block {
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

  async ethToTokenSwap(account: Account) {
    const logger = this.getLogger(account);

    const native = this.chain.getNative();

    const randomNormalizedAmount =
      await account.getRandomNormalizedAmountOfBalance(
        native,
        this.minWorkAmountPercent,
        this.maxWorkAmountPercent
      );

    const openOcean = new OpenOceanExchange();

    const { hash, inReadableAmount, outReadableAmount } = await openOcean.swap({
      account,
      fromToken: native,
      toToken: this.token,
      normalizedAmount: randomNormalizedAmount,
    });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `swap ${inReadableAmount} ${native} -> ${outReadableAmount} ${this.token} success: ${hashLink}`
    );

    return true;
  }

  async approve(account: Account) {
    const logger = this.getLogger(account);

    logger.debug("start approve");

    const openOcean = new OpenOceanExchange();

    const contractAddress = openOcean.getAddressToApprove(this.chain);

    if (!contractAddress) {
      throw new Error(
        `Contract address of open ocean for ${this.chain} is not found`
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

  async tokenToEthSwap(account: Account) {
    const logger = this.getLogger(account);

    const native = this.chain.getNative();

    const accountBalance = await this.token.normalizedBalanceOf(
      account.address
    );

    const openOcean = new OpenOceanExchange();

    const { hash, inReadableAmount, outReadableAmount } = await openOcean.swap({
      account,
      fromToken: this.token,
      toToken: native,
      normalizedAmount: accountBalance,
    });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `swap ${inReadableAmount} ${this.token} -> ${outReadableAmount} ${native} success: ${hashLink}`
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

    const swapTransaction = new Transaction({
      name: step.createDefaultTransactionName("swap"),
      fn: () => this.ethToTokenSwap(account),
    });
    step.push(swapTransaction);

    return [step];
  }

  allSteps(account: Account) {
    const startSwapSteps = this.startSteps(account);
    const resetSwapSteps = this.resetSteps(account);
    return [...startSwapSteps, ...resetSwapSteps];
  }

  resetSteps(account: Account) {
    const logger = this.getLogger(account);

    logger.debug(`getting reset steps`);

    const step = new Step({
      name: this.createDefaultStepName("reset"),
      transactions: [],
    });

    const approveTransaction = new Transaction({
      name: step.createDefaultTransactionName("approve"),
      fn: () => this.approve(account),
    });
    step.push(approveTransaction);

    const swapTransaction = new Transaction({
      name: step.createDefaultTransactionName("swap"),
      fn: () => this.tokenToEthSwap(account),
    });
    step.push(swapTransaction);

    return [step];
  }
}

export default BaseOpenOceanEthToTokenSwap;
