import Cli from "./cli";
import logger from "./utils/logger";
import BlockWorker from "./worker/block";

const main = async () => {
  const { mode, config } = await new Cli().run();

  switch (mode) {
    case "block": {
      await new BlockWorker(config).run();
      break;
    }
    default: {
      logger.error("this mode is not available");
    }
  }
};

main();
