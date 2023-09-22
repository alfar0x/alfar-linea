import formatIntervalSec from "../datetime/formatIntervalSec";

import createMessage from "./createMessage";
import getMyIp from "./getMyIp";
import logger from "./logger";
import sleep from "./sleep";

const sleepSec = 60;

const waitInternetConnection = async () => {
  while (true) {
    const myIp = await getMyIp();

    if (myIp) return myIp;

    logger.error(
      createMessage(
        "internet connection error",
        `next check: ${formatIntervalSec(sleepSec)}`,
      ),
    );
    await sleep(sleepSec);
  }
};

export default waitInternetConnection;
