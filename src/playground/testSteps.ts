import Step from "../core/step";
import sleep from "../utils/other/sleep";

const testSteps = async (steps: Step[], txSleepSec = 30) => {
  console.info(steps.map(String));

  while (steps.length) {
    const step = steps.shift();

    if (!step) {
      console.info("steps finish");
      return;
    }

    console.info(`step start: ${step}`);

    while (!step.isEmpty()) {
      const tx = step.shift();

      if (!tx) {
        console.info("step finish");
        break;
      }

      console.info(`tx start: ${tx}`);

      const isSent = await tx.run();

      console.info(`${tx}: ${isSent}`);

      if (isSent) await sleep(txSleepSec);

      console.info(`tx end: ${tx}`);
    }
    console.info(`step end: ${step}`);
  }

  console.info("steps finish");
  return;
};

export default testSteps;
