import Big from "big.js";
import Web3 from "web3";

import formatIntervalSec from "../datetime/formatIntervalSec";
import logger from "../other/logger";
import sleep from "../other/sleep";

const waitGasLimit = async (
  w3: Web3,
  sleepSec: number,
  getMaxGwei: () => number,
) => {
  while (true) {
    const maxGwei = getMaxGwei();

    const gasPriceWei = await w3.eth.getGasPrice();

    const currentFeePerGasGweiBig = Big(
      Web3.utils.fromWei(gasPriceWei, "Gwei"),
    ).round(2);

    const isGasLimitValid = currentFeePerGasGweiBig.lte(maxGwei);

    const msg = [
      `gas ${currentFeePerGasGweiBig.toString()}`,
      `limit ${maxGwei}`,
    ];

    if (isGasLimitValid) {
      msg.push(`is ok`);
      logger.info(msg.join(" | "));
      return;
    }

    msg.push(`next check ${formatIntervalSec(sleepSec)}`);

    logger.warn(msg.join(" | "));

    await sleep(sleepSec);
  }
};

export default waitGasLimit;
