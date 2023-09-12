import Cli from "./cli";
import logger from "./utils/other/logger";
import Checker from "./worker/checker";
import JobsGenerator from "./worker/jobsGenerator";

const main = async () => {
  try {
    const { mode, config } = await new Cli().run();

    switch (mode) {
      case "job-generator": {
        await new JobsGenerator(config).run();
        break;
      }
      case "checker": {
        await new Checker(config).run();
        break;
      }
      default: {
        throw new Error("this mode is not available");
      }
    }
  } catch (error) {
    logger.error((error as Error).message);
  }
};

main();
