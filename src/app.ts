import Cli from "./cli";
import logger from "./utils/other/logger";
import Checker from "./worker/checker";
import EncrypterWorker from "./worker/encrypter";
import TasksGenerator from "./worker/tasksGenerator";

const main = async () => {
  try {
    const { mode, config } = await new Cli().run();

    switch (mode) {
      case "task-generator": {
        return await new TasksGenerator(config).run();
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
