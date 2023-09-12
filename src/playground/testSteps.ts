import Step from "../core/step";
import sleep from "../utils/other/sleep";

const testSteps = async (steps: Step[], txSleepSec = 30) => {
  console.log(steps.map(String));

  while (steps.length) {
    const step = steps.shift();

    if (!step) {
      console.log("steps finish");
      return;
    }

    console.log(`step start: ${step}`);

    while (!step.isEmpty()) {
      const tx = step.shift();

      if (!tx) {
        console.log("step finish");
        break;
      }

      console.log(`tx start: ${tx}`);

      const isSent = await tx.run();

      console.log(`${tx}: ${isSent}`);

      if (isSent) await sleep(txSleepSec);

      console.log(`tx end: ${tx}`);
    }
    console.log(`step end: ${step}`);
  }

  console.log("steps finish");
  return;
};

export default testSteps;
