import Cli from "./cli";
import logger from "./utils/other/logger";
import Checker from "./worker/checker";
import EncrypterWorker from "./worker/encrypter";
import TasksRunner from "./worker/tasksRunner";

const main = async () => {
  try {
    const { mode, config } = await new Cli().run();

    switch (mode) {
      case "task-runner": {
        return await new TasksRunner(config).run();
      }
      case "checker": {
        return await new Checker(config).run();
      }
      case "encrypter": {
        return await new EncrypterWorker(config).run();
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
