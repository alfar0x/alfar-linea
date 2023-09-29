import Config from "../../../core/config";
import formatObjectsWithKeyPad from "../../../utils/formatters/formatObjectsWithKeyPad";
import getObjectAsPathList from "../../../utils/other/getObjectAsPathList";
import processPaths from "./processPaths";

import { dynamicSchema, fixedSchema } from "./schemas";

class TasksRunnerConfig extends Config<
  typeof fixedSchema,
  typeof dynamicSchema
> {
  public constructor(params: { configFileName: string }) {
    const { configFileName } = params;

    super({ configFileName, fixedSchema, dynamicSchema });
  }

  public info() {
    const { fixed } = this;
    const dynamic = this.dynamic();

    const objectPaths = getObjectAsPathList({ dynamic, fixed });
    const processed = processPaths(objectPaths);

    return formatObjectsWithKeyPad(processed);
  }
}

export default TasksRunnerConfig;
