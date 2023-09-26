import * as dotenv from "dotenv";
import { z } from "zod";

import zodErrorPrettify from "../zod/zodErrorPrettify";

const getEnv = () => {
  dotenv.config({ path: ".env.prod" });

  const schema = z.object({
    NODE_ENV: z.union([z.literal("dev"), z.literal("prod")]),
  });

  const env = schema.safeParse(process.env);

  if (!env.success) {
    // eslint-disable-next-line no-console
    console.error(".env file error: ", zodErrorPrettify(env.error.issues));
    process.exit();
  }

  return env.data;
};

const env = getEnv();

export default env;
