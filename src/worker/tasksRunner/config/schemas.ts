import { z } from "zod";

import ACTION_PROVIDERS from "../../../constants/actionProviders";
import createUnionSchema from "../../../utils/zod/createUnionSchema";
import getFilenameRefine from "../../../utils/zod/getFilenameRefine";

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
      max: z.number().multipleOf(1).positive().max(10000),
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
  maxLineaGwei: z.number().multipleOf(0.05).positive().max(10000),
  maxParallelAccounts: maxParallelAccountsSchema,
  maxTxPriceUsd: z.number().multipleOf(0.1).positive().max(10000),
  minEthBalance: z.number().multipleOf(0.0001).min(0.0005),
});

const providersSchema = z.array(createUnionSchema(ACTION_PROVIDERS)).min(1);

const transactionsLimitSchema = z
  .object({
    min: z.number().multipleOf(1).positive().min(1).max(10000),
    max: z.number().multipleOf(1).positive().max(10000),
  })
  .refine(...minMaxRefine);

const filesSchema = z.object({
  privateKeys: getFilenameRefine(".txt"),
  proxies: getFilenameRefine(".txt"),
});

const proxySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("server"), serverIsRandom: z.boolean() }),
  z.object({ type: z.literal("mobile"), mobileIpChangeUrl: z.string().url() }),
]);

const rpcSchema = z.object({
  linea: z.string().url(),
});

const workingAmountPercentSchema = z
  .object({
    min: z.number().multipleOf(0.1).positive().min(0.1),
    max: z.number().positive().multipleOf(0.1).max(30),
  })
  .refine(...minMaxRefine);

export const fixedSchema = z.object({
  files: filesSchema,
  isAccountsShuffle: z.boolean(),
  isCheckBalanceOnStart: z.boolean(),
  isShuffleAccountOnStepsEnd: z.boolean(),
  providers: providersSchema,
  proxy: proxySchema,
  rpc: rpcSchema,
  transactionsLimit: transactionsLimitSchema,
  workingAmountPercent: workingAmountPercentSchema,
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
