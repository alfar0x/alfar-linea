import Cli from "./cli";
import logger from "./utils/other/logger";
import JobWorker from "./worker/jobs";

const main = async () => {
  const { mode, config } = await new Cli().run();

  switch (mode) {
    case "job-generator": {
      await new JobWorker(config).run();
      break;
    }
    default: {
      logger.error("this mode is not available");
    }
  }
};

main();
