import startMenu from "./utils/cli/startMenu";
import formatError from "./utils/formatters/formatError";
import logger from "./utils/other/logger";
import Checker from "./worker/checker";
import EncrypterWorker from "./worker/encrypter";
import TasksRunner from "./worker/tasksRunner";

const main = async () => {
  const { mode, config } = await startMenu();

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
};

void main().catch((error) => {
  logger.error((error as Error).message);
  logger.debug(formatError(error));
});
