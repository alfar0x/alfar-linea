import fs from "fs";

import json5 from "json5";
import { z } from "zod";

import logger from "../utils/other/logger";
import zodErrorPrettify from "../utils/zod/zodErrorPrettify";

class Config<F extends z.ZodTypeAny, D extends z.ZodTypeAny> {
  private readonly fileName: string;

  private readonly schema: z.ZodObject<{ fixed: F; dynamic: D }>;

  public fixed: z.infer<F>;
  private _dynamic: z.infer<D>;

  public constructor(params: {
    configFileName: string;
    fixedSchema: F;
    dynamicSchema: D;
  }) {
    const { configFileName, fixedSchema, dynamicSchema } = params;

    this.fileName = configFileName;

    this.schema = z.object({
      dynamic: dynamicSchema,
      fixed: fixedSchema,
    });

    const { fixed, dynamic } = this.getConfigData();

    this._dynamic = dynamic;
    this.fixed = fixed;
  }

  private getConfigData() {
    const fileData = fs.readFileSync(this.fileName, {
      encoding: "utf-8",
    });

    const result = this.schema.safeParse(json5.parse(fileData));

    if (result.success) return result.data;

    const errorMessage = zodErrorPrettify(result.error.issues);

    throw new Error(errorMessage);
  }

  public dynamic() {
    try {
      this._dynamic = this.getConfigData().dynamic;
    } catch (error) {
      const message = (error as Error).message;

      logger.error(
        `used the previous dynamic value due to error. Details: ${message}`,
      );
    }

    return this._dynamic;
  }
}

export default Config;
