import { dynamicSchema, fixedSchema } from "./schemas";
import Config from "../../core/config";

class BlockConfig extends Config<typeof fixedSchema, typeof dynamicSchema> {
  constructor(params: { configFileName: string }) {
    const { configFileName } = params;

    super({ configFileName, fixedSchema, dynamicSchema });
  }
}

export default BlockConfig;
