/* eslint-disable @typescript-eslint/no-explicit-any */
import formatIntervalSec from "../datetime/formatIntervalSec";

import createMessage from "./createMessage";
import getMyIp from "./getMyIp";
import logger from "./logger";
import sleep from "./sleep";

const waitInternetConnectionLoop = async (sleepSec = 60, maxRetries = 1000) => {
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

const waitInternetConnection = (sleepSec = 60, maxRetries = 1000) => {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    const isFunc = originalMethod instanceof Function;
    if (!isFunc) return descriptor;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const myIp = await getMyIp();
        if (myIp) throw error;
        await waitInternetConnectionLoop(sleepSec, maxRetries);
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
};

export default waitInternetConnection;
