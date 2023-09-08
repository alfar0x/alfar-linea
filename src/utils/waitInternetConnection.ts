import sleep from "../common/sleep";
import logger from "../common/logger";
import formatIntervalSec from "./formatIntervalSec";
import getMyIp from "./getMyIp";
const sleepSec = 60;

const waitInternetConnection = async () => {
  while (true) {
    const myIp = await getMyIp();

    if (myIp) return myIp;

    const msg = [
      "internet connection error",
      `next check: ${formatIntervalSec(sleepSec)}`,
    ].join(" | ");

    logger.error(msg);
    await sleep(sleepSec);
  }
};

export default waitInternetConnection;
