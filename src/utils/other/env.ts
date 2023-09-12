import * as dotenv from "dotenv";
import { z } from "zod";

import errorPrettify from "../zod/errorPrettify";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.union([z.literal("dev"), z.literal("prod")]),
});

type EnvConfig = z.infer<typeof schema>;

export { EnvConfig };

const env = schema.safeParse(process.env);

if (!env.success) {
  console.error(".env file error: ", errorPrettify(env.error.issues));
  process.exit();
}

export default env.data;
