import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.union([z.literal("dev"), z.literal("prod")]),
});

type EnvConfig = z.infer<typeof schema>;

export { EnvConfig };

export default schema.parse(process.env);
