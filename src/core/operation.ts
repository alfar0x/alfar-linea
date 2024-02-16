import { z } from "zod";
import createUnionSchema from "../utils/zod/createUnionSchema";
import CHAIN_NAMES from "../constants/chainNames";
import ACTIONS, {
  ACTION_LEND,
  ACTION_RANDOM,
  ACTION_SWAP,
} from "../constants/actions";
import PROVIDERS from "../constants/providers";

const swapOperationSchema = z.string().transform((s) => {
  const splitted = s.split("_");

  if (splitted.length !== 2) {
    throw new Error("operation is not valid");
  }

  return z.object({ fromToken: z.string(), toToken: z.string() });
});

const lendOperationSchema = z.string().transform((s) => {
  const splitted = s.split("_");

  if (splitted.length !== 2) {
    throw new Error("operation is not valid");
  }

  return z.object({ token: z.string() });
});

const commonSchemaObj = {
  chain: createUnionSchema(CHAIN_NAMES),
  provider: createUnionSchema(PROVIDERS),
  operation: z.string(),
};

export const opIdSchema = z.string().transform((s) => {
  const splitted = s.split(":");

  if (splitted.length !== 4) {
    throw new Error("operation is not valid");
  }

  const [chain, action, provider, operation] = splitted;

  return z
    .discriminatedUnion("action", [
      z.object({
        action: z.literal(ACTION_LEND),
        ...commonSchemaObj,
        operationParsed: lendOperationSchema.parse(operation),
      }),
      z.object({
        action: z.literal(ACTION_SWAP),
        ...commonSchemaObj,
        operationParsed: swapOperationSchema.parse(operation),
      }),
      z.object({
        action: z.literal(ACTION_RANDOM),
        ...commonSchemaObj,
      }),
    ])
    .parse({ chain, action, provider, operation });
});
