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
        await new TasksRunner(config).run();
        return;
      }
      case "checker": {
        await new Checker(config).run();
        return;
      }
      case "encrypter": {
        await new EncrypterWorker(config).run();
        return;
      }
      default: {
        throw new Error("this mode is not available");
      }
    }
  } catch (error) {
    logger.error((error as Error).message);
  }
};

void main();
