import Step from "../core/step";
import logger from "../utils/other/logger";
import sleep from "../utils/other/sleep";

const testSteps = async (steps: Step[], txSleepSec = 30) => {
  logger.info(steps.map(String));

  while (steps.length) {
    const step = steps.shift();

    if (!step) {
      logger.info("steps finish");
      return;
    }

    logger.info(`step start: ${step}`);

    while (!step.isEmpty()) {
      const tx = step.shift();

      if (!tx) {
        logger.info("step finish");
        break;
      }

      logger.info(`tx start: ${tx}`);

      const isSent = await tx.run();

      logger.info(`${tx}: ${isSent}`);

      if (isSent) await sleep(txSleepSec);

      logger.info(`tx end: ${tx}`);
    }
    logger.info(`step end: ${step}`);
  }

  logger.info("steps finish");
  return;
};

export default testSteps;
