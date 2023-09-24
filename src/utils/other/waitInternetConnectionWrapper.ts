import formatIntervalSec from "../datetime/formatIntervalSec";

import createMessage from "./createMessage";
import getMyIp from "./getMyIp";
import logger from "./logger";
import sleep from "./sleep";

const waitForInternetConnection = async (sleepSec = 60, maxRetries = 1000) => {
  let retries = 0;

  while (retries < maxRetries) {
    const myIp = await getMyIp();

    if (myIp) return;

    logger.error(
      createMessage(
        "internet connection error",
        `next check ${formatIntervalSec(sleepSec)}`,
      ),
    );

    await sleep(sleepSec);

    retries += 1;
  }

  throw new Error("Max retries to check internet connection failed");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const waitInternetConnectionWrapper = <T extends (...args: any[]) => any>(
  fn: T,
) => {
  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const myIp = await getMyIp();
      if (myIp) throw error;
      await waitForInternetConnection();
      return await fn(...args);
    }
  };

  return wrapped as T;
};

export default waitInternetConnectionWrapper;
