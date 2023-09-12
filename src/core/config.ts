import fs from "fs";

import json5 from "json5";
import { z } from "zod";

import logger from "../utils/other/logger";
import errorPrettify from "../utils/zod/errorPrettify";

class Config<F extends z.ZodTypeAny, D extends z.ZodTypeAny> {
  private fileName: string;

  private schema: z.ZodObject<{ fixed: F; dynamic: D }>;

  public fixed: z.infer<F>;
  private _dynamic: z.infer<D>;

  constructor(params: {
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

    const { fixed, dynamic } = this.initializeConfig();

    this._dynamic = dynamic;
    this.fixed = fixed;
  }

  private getConfigData() {
    const fileData = fs.readFileSync(this.fileName, {
      encoding: "utf-8",
    });

    const result = this.schema.safeParse(json5.parse(fileData));

    if (result.success) return result.data;

    const errorMessage = errorPrettify(result.error.issues);

    throw new Error(errorMessage);
  }

  private initializeConfig() {
    try {
      return this.getConfigData();
    } catch (error) {
      logger.error((error as Error).message);
      process.exit();
    }
  }

  public dynamic() {
    try {
      this._dynamic = this.getConfigData().dynamic;
    } catch (error) {
      const { message } = error as Error;

      logger.error(
        `used the previous dynamic value due to error. Details: ${message}`
      );
    }

    return this._dynamic;
  }
}

export default Config;
