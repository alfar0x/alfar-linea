import formatIntervalSec from "../datetime/formatIntervalSec";

import createMessage from "./createMessage";
import getMyIp from "./getMyIp";
import logger from "./logger";
import sleep from "./sleep";

const sleepSec = 60;

const waitInternetConnection = async () => {
  // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
  while (true) {
    const myIp = await getMyIp();

    if (myIp) return myIp;

    logger.error(
      createMessage(
        "internet connection error",
        `next check ${formatIntervalSec(sleepSec)}`,
      ),
    );
    await sleep(sleepSec);
  }
};

export default waitInternetConnection;
