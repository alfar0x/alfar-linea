/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

import formatIntervalSec from "../formatters/formatIntervalSec";
import formatMessages from "../formatters/formatMessages";

import logger from "./logger";
import sleep from "./sleep";

type Response = {
  data?: { ip?: string };
};

const ipCheckerUrl = "https://api.ipify.org?format=json";

const getMyIp = async () => {
  try {
    const response = await axios.get<unknown, Response>(ipCheckerUrl);

    return response.data?.ip || null;
  } catch (error) {
    return null;
  }
};

const waitInternetConnectionLoop = async (sleepSec = 60, maxRetries = 1000) => {
  let retries = 0;

  while (retries < maxRetries) {
    const myIp = await getMyIp();

    if (myIp) return;

    logger.error(
      formatMessages(
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
