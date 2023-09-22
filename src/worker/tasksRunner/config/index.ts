import Config from "../../../core/config";

import { dynamicSchema, fixedSchema } from "./schemas";

class TasksRunnerConfig extends Config<
  typeof fixedSchema,
  typeof dynamicSchema
> {
  public constructor(params: { configFileName: string }) {
    const { configFileName } = params;

    super({ configFileName, fixedSchema, dynamicSchema });
  }
}

export default TasksRunnerConfig;
