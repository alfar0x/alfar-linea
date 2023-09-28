import Config from "../../../core/config";
import formatObjectAsPath from "../../../utils/formatters/formatObjectAsPath";

import { dynamicSchema, fixedSchema } from "./schemas";

class TasksRunnerConfig extends Config<
  typeof fixedSchema,
  typeof dynamicSchema
> {
  public constructor(params: { configFileName: string }) {
    const { configFileName } = params;

    super({ configFileName, fixedSchema, dynamicSchema });
  }

  public toString() {
    const { fixed } = this;
    const dynamic = this.dynamic();

    return formatObjectAsPath({ dynamic, fixed });
  }
}

export default TasksRunnerConfig;
