import { z } from "zod";

import ACTION_PROVIDERS from "../../../constants/actionProviders";
import createUnionSchema from "../../../utils/zod/createUnionSchema";
import getFilenameRefine from "../../../utils/zod/getFilenameRefine";

const minMaxRefine = [
  (schema: { min: number; max: number }) => schema.max >= schema.min,
  "Max must be greater than min",
] as const;

export const dynamicSchema = z.object({
  maxLineaGwei: z.number().positive(),
  minEthBalance: z.number().min(0.001),
});

const providersSchema = z.array(createUnionSchema(ACTION_PROVIDERS)).min(1);

const transactionsLimitSchema = z
  .object({ min: z.number().positive().min(1), max: z.number().positive() })
  .refine(...minMaxRefine);

const delaySecSchema = z.object({
  transaction: z
    .object({ min: z.number().positive().min(20), max: z.number().positive() })
    .refine(...minMaxRefine),
  step: z
    .object({ min: z.number().positive().min(60), max: z.number().positive() })
    .refine(...minMaxRefine),
});

const filesSchema = z.object({
  privateKeys: getFilenameRefine(".txt"),
  proxies: getFilenameRefine(".txt"),
});

const maxParallelAccountsSchema = z.number().positive().min(1).max(10);

const proxySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  // @TODO disabled until tested
  // z.object({ type: z.literal("server"), serverIsRandom: z.boolean() }),
  // z.object({ type: z.literal("mobile"), mobileIpChangeUrl: z.string().url() }),
]);

const rpcSchema = z.object({
  linea: z.string().url(),
});

const workingAmountPercentSchema = z
  .object({
    min: z.number().positive().min(0.1),
    max: z.number().positive().max(30),
  })
  .refine(...minMaxRefine);

export const fixedSchema = z.object({
  delaySec: delaySecSchema,
  files: filesSchema,
  isAccountsShuffle: z.boolean(),
  maxParallelAccounts: maxParallelAccountsSchema,
  providers: providersSchema,
  proxy: proxySchema,
  rpc: rpcSchema,
  isCheckBalanceOnStart: z.boolean(),
  transactionsLimit: transactionsLimitSchema,
  workingAmountPercent: workingAmountPercentSchema,
});
// @TODO disabled until tested
// .refine(
//   (schema) =>
//     !(schema.proxy.type === "mobile" && schema.maxParallelAccounts === 1),
//   "Only 1 parallel account can be used with mobile proxy "
// );

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
