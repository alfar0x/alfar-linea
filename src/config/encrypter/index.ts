import Config from "../../core/config";

import { dynamicSchema, fixedSchema } from "./schemas";

class EncrypterConfig extends Config<typeof fixedSchema, typeof dynamicSchema> {
  constructor(params: { configFileName: string }) {
    const { configFileName } = params;

    super({ configFileName, fixedSchema, dynamicSchema });
  }
}

export default EncrypterConfig;
