import formatIntervalSec from "../datetime/formatIntervalSec";

import getMyIp from "./getMyIp";
import logger from "./logger";
import sleep from "./sleep";

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
