import Cli from "./cli";
import logger from "./utils/other/logger";
import Checker from "./worker/checker";
import JobsGenerator from "./worker/jobsGenerator";

const main = async () => {
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
      logger.error("this mode is not available");
    }
  }
};

main();
