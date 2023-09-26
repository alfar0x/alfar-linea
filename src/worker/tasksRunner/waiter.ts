import Big from "big.js";
import Web3 from "web3";

import Chain from "../../core/chain";
import formatIntervalSec from "../../utils/datetime/formatIntervalSec";
import createMessage from "../../utils/other/createMessage";
import logger from "../../utils/other/logger";
import sleep from "../../utils/other/sleep";
import randomInteger from "../../utils/random/randomInteger";

import TasksRunnerConfig from "./config";

const WAIT_GAS_SEC = 10 * 60;

class Waiter {
  private readonly chain: Chain;
  private readonly config: TasksRunnerConfig;

  public constructor(params: { chain: Chain; config: TasksRunnerConfig }) {
    const { chain, config } = params;

    this.chain = chain;
    this.config = config;
  }

  public async waitStep() {
    const { min, max } = this.config.dynamic().delaySec.step;

    const nextStepRunSec = randomInteger(min, max).toNumber();

    const nextStepRunTimeStr = formatIntervalSec(nextStepRunSec);

    logger.info(`next step run ${nextStepRunTimeStr}`);

    await sleep(nextStepRunSec);
  }

  public async waitTransaction() {
    const { min, max } = this.config.dynamic().delaySec.transaction;

    const nextTransactionRunSec = randomInteger(min, max).toNumber();

    const nextTransactionRunTimeStr = formatIntervalSec(nextTransactionRunSec);

    logger.info(`next transaction run ${nextTransactionRunTimeStr}`);

    await sleep(nextTransactionRunSec);
  }

  public async waitGasLimit() {
    // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
    while (true) {
      const maxGwei = this.config.dynamic().maxLineaGwei;

      const gasPriceWei = await this.chain.w3.eth.getGasPrice();

      const gasGwei = Web3.utils.fromWei(gasPriceWei, "Gwei");

      const currentFeePerGasGweiBig = Big(gasGwei).round(2);

      const isGasLimitValid = currentFeePerGasGweiBig.lte(maxGwei);

      if (isGasLimitValid) return;

      const msg = [
        `gas ${currentFeePerGasGweiBig.toString()}`,
        `limit ${maxGwei}`,
        `next check ${formatIntervalSec(WAIT_GAS_SEC)}`,
      ];

      logger.warn(createMessage(...msg));

      await sleep(WAIT_GAS_SEC);
    }
  }
}

export default Waiter;
