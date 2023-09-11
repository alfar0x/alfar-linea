import { z } from "zod";

export const dynamicSchema = z.object({});

const filesSchema = z
  .object({
    privateKeys: z
      .string()
      .refine(
        (filename) => !filename.endsWith(".example.txt"),
        "Example files cannot be used. Read README.md instructions please"
      )
      .optional(),
    addresses: z
      .string()
      .refine(
        (filename) => !filename.endsWith(".example.txt"),
        "Example files cannot be used. Read README.md instructions please"
      )
      .optional(),
    proxies: z
      .string()
      .refine(
        (filename) => !filename.endsWith(".example.txt"),
        "Example files cannot be used. Read README.md instructions please"
      ),
  })
  .refine(
    (data) => data.addresses || data.privateKeys,
    "Either privateKeys or addresses must be filled in."
  );

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

export const fixedSchema = z.object({
  files: filesSchema,
  maxParallelAccounts: maxParallelAccountsSchema,
  delayBetweenChunkSec: z.number().positive(),
  hideBalanceLessThanUsd: z.number(),
  proxy: proxySchema,
  rpc: rpcSchema,
});
// @TODO disabled until tested
// .refine(
//   (schema) =>
//     !(schema.proxy.type === "mobile" && schema.maxParallelAccounts === 1),
//   "Only 1 parallel account can be used with mobile proxy "
// );

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
