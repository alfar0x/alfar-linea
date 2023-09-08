import { dynamicSchema, fixedSchema } from "./schemas";
import Config from "../../core/config";

class BlockConfig extends Config<typeof fixedSchema, typeof dynamicSchema> {
  constructor(configFileName: string) {
    super({ configFileName: configFileName, fixedSchema, dynamicSchema });
  }
}

export default BlockConfig;
