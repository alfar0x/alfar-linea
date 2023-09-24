import * as dotenv from "dotenv";
import { z } from "zod";

import errorPrettify from "../zod/errorPrettify";

const getEnv = () => {
  dotenv.config({ path: ".env.prod" });

  const schema = z.object({
    NODE_ENV: z.union([z.literal("dev"), z.literal("prod")]),
    TELEGRAM_TOKEN: z.string().optional(),
    TELEGRAM_CHAT_ID: z
      .string()
      .regex(/\d+/, "Must be a number")
      .optional()
      .transform((str) => (str ? Number(str) : undefined)),
  });

  const env = schema.safeParse(process.env);

  if (!env.success) {
    // eslint-disable-next-line no-console
    console.error(".env file error: ", errorPrettify(env.error.issues));
    process.exit();
  }

  return env.data;
};

const env = getEnv();

export default env;
