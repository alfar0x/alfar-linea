import Account from "../../core/account";
import { SwapAction } from "../../core/action/swap";
import Block from "../../core/block";
import Chain from "../../core/chain";
import Step from "../../core/step";
import Token from "../../core/token";
import Transaction from "../../core/transaction";
import { Amount } from "../../types";

class SwapBlock extends Block {
  private action: SwapAction;
  fromToken: Token;
  toToken: Token;

  constructor(params: {
    action: SwapAction;
    chain: Chain;
    pair: readonly [string, string];
  }) {
    const { action, chain, pair } = params;

    const [fromTokenName, toTokenName] = pair;

    const name = `${action.name}_${fromTokenName}_${toTokenName}`;

    super({ name, chain });
    this.action = action;
    this.fromToken = this.chain.getTokenByName(fromTokenName);
    this.toToken = this.chain.getTokenByName(toTokenName);
  }

  private async approve(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    const logger = this.getLogger(account);

    logger.debug("start approve");

    if (this.fromToken.isNative) return false;

    const contractAddress = this.action.getApproveAddress(this.chain);

    if (!contractAddress) {
      throw new Error(
        `Contract address of ${this.action} for ${this.chain} is not found`,
      );
    }

    const hash = await this.fromToken.approve(
      account,
      contractAddress,
      normalizedAmount,
    );

    const readableAmount =
      await this.fromToken.toReadableAmount(normalizedAmount);

    if (!hash) {
      logger.info(`already approved ${readableAmount} ${this.fromToken}`);
      return false;
    }

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `approve ${readableAmount} ${this.fromToken} success: ${hashLink}`,
    );

    return true;
  }

  private async swap(params: { account: Account; normalizedAmount: Amount }) {
    const { account, normalizedAmount } = params;

    const logger = this.getLogger(account);

    const { hash, inReadableAmount, outReadableAmount } =
      await this.action.swap({
        account,
        fromToken: this.fromToken,
        toToken: this.toToken,
        normalizedAmount,
      });

    const hashLink = this.chain.getHashLink(hash);

    logger.info(
      `swap ${inReadableAmount} ${this.fromToken} -> ${outReadableAmount} ${this.toToken} success: ${hashLink}`,
    );

    return true;
  }

  private swapSteps(params: {
    namePrefix: string;
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { namePrefix, account, normalizedAmount } = params;
    const logger = this.getLogger(account);
    logger.debug(`getting swap steps`);

    const step = new Step({
      name: this.createDefaultStepName(`SWAP_${namePrefix}`),
      transactions: [],
    });

    const approveTransaction = new Transaction({
      name: step.createDefaultTransactionName(`APPROVE`),
      fn: () => this.approve({ account, normalizedAmount }),
    });
    step.push(approveTransaction);

    const swapTransaction = new Transaction({
      name: step.createDefaultTransactionName(`SWAP`),
      fn: () => this.swap({ account, normalizedAmount }),
    });

    step.push(swapTransaction);

    return [step];
  }

  async swapBalanceSteps(params: { account: Account }) {
    const { account } = params;

    const normalizedAmount = await this.fromToken.normalizedBalanceOf(
      account.address,
    );

    return this.swapSteps({ namePrefix: "BALANCE", account, normalizedAmount });
  }

  async swapPercentSteps(params: {
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

    return this.swapSteps({ namePrefix: "PERCENT", account, normalizedAmount });
  }
}

export default SwapBlock;
