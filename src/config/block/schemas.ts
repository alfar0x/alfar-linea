import { z } from "zod";
import createUnionSchema from "../../utils/createUnionSchema";
import availableBlocks from "./availableBlocks";

const minMaxRefine = [
  (schema: { min: number; max: number }) => schema.max >= schema.min,
  "Max must be greater than min",
] as const;

export const dynamicSchema = z.object({
  maxLineaGwei: z.number().positive(),
  minEthBalance: z.number().positive().min(0.001),
});

const blocksSchema = z.array(createUnionSchema(availableBlocks)).min(1);

const blocksCountSchema = z
  .object({ min: z.number().positive().min(1), max: z.number().positive() })
  .refine(...minMaxRefine);

const delaySecSchema = z.object({
  transaction: z
    .object({ min: z.number().positive().min(10), max: z.number().positive() })
    .refine(...minMaxRefine),
  step: z
    .object({ min: z.number().positive().min(60), max: z.number().positive() })
    .refine(...minMaxRefine),
});

const filesSchema = z.object({
  privateKeys: z
    .string()
    .refine(
      (filename) => !filename.endsWith(".example.txt"),
      "Example files cannot be used. Read README.md instructions please"
    ),
  proxies: z
    .string()
    .refine(
      (filename) => !filename.endsWith(".example.txt"),
      "Example files cannot be used. Read README.md instructions please"
    ),
});

const maxParallelAccountsSchema = z.number().positive().min(1);

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
  .object({ min: z.number().positive(), max: z.number().positive() })
  .refine(...minMaxRefine);

export const fixedSchema = z.object({
  blocks: blocksSchema,
  blocksCount: blocksCountSchema,
  delaySec: delaySecSchema,
  files: filesSchema,
  isBlockDuplicates: z.boolean(),
  isShuffle: z.boolean(),
  maxParallelAccounts: maxParallelAccountsSchema,
  proxy: proxySchema,
  rpc: rpcSchema,
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
