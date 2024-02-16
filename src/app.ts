import startMenu from "./utils/cli/startMenu";
import formatError from "./utils/formatters/formatError";
import logger from "./utils/other/logger";
import TasksRunner from "./worker/tasksRunner";

const main = async () => {
  const { config } = await startMenu();
  await new TasksRunner(config).run();
};

void main().catch((error) => {
  logger.error((error as Error).message);
  logger.debug(formatError(error));
});
