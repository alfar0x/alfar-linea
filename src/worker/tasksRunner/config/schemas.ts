import { z } from "zod";

import ACTION_PROVIDERS from "../../../constants/actionProviders";
import createUnionSchema from "../../../utils/zod/createUnionSchema";
import getFilenameRefineSchema from "../../../utils/zod/getFilenameRefineSchema";

const minMaxRefine = [
  (schema: { min: number; max: number }) => schema.max >= schema.min,
  "Max must be greater than min",
] as const;

const delaySecSchema = z.object({
  transaction: z
    .object({
      min: z.number().multipleOf(1).positive().min(20),
      max: z.number().multipleOf(1).positive().max(10000),
    })
    .refine(...minMaxRefine),
  step: z
    .object({
      min: z.number().multipleOf(1).positive().min(60),
      max: z.number().multipleOf(1).positive().max(100000),
    })
    .refine(...minMaxRefine),
});

const maxParallelAccountsSchema = z
  .number()
  .multipleOf(1)
  .positive()
  .min(1)
  .max(10);

export const dynamicSchema = z.object({
  delaySec: delaySecSchema,
  maxLineaGwei: z.number().multipleOf(0.05).positive().max(1000),
  maxParallelAccounts: maxParallelAccountsSchema,
  maxTxFeeUsd: z.number().multipleOf(0.1).positive().max(100),
});

const providersSchema = z.array(createUnionSchema(ACTION_PROVIDERS)).min(1);

const transactionsLimitSchema = z
  .object({
    min: z.number().multipleOf(1).positive().min(1),
    max: z.number().multipleOf(1).positive().max(10000),
  })
  .refine(...minMaxRefine);

const filesSchema = z.object({
  privateKeys: getFilenameRefineSchema(".txt"),
  proxies: getFilenameRefineSchema(".txt"),
});

const proxySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("server"), serverIsRandom: z.boolean() }),
  z.object({ type: z.literal("mobile"), mobileIpChangeUrl: z.string().url() }),
]);

const rpcSchema = z.object({ linea: z.string().url() });

const workingAmountPercentSchema = z
  .object({
    min: z.number().multipleOf(0.1).positive().min(0.1),
    max: z.number().positive().multipleOf(0.1).max(30),
  })
  .refine(...minMaxRefine);

const onCurrentTaskEndSchema = z.union([
  z.literal("CREATE_NEXT_TASK"),
  z.literal("WAIT_OTHERS"),
  z.literal("MOVE_RANDOMLY"),
]);

const approveMultiplierSchema = z
  .object({
    min: z.number().multipleOf(1).positive().min(1),
    max: z.number().multipleOf(1).positive().max(100),
  })
  .refine(...minMaxRefine);

export const fixedSchema = z.object({
  approveMultiplier: approveMultiplierSchema,
  files: filesSchema,
  maxAccountFeeUsd: z.number().multipleOf(0.1).positive().max(1000),
  minEthBalance: z.number().multipleOf(0.0001).min(0.002),
  onCurrentTaskEnd: onCurrentTaskEndSchema,
  providers: providersSchema,
  proxy: proxySchema,
  rpc: rpcSchema,
  transactionsLimit: transactionsLimitSchema,
  workingAmountPercent: workingAmountPercentSchema,
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
