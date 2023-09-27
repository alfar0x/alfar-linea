import { z } from "zod";

import getFilenameRefineSchema from "../../../utils/zod/getFilenameRefineSchema";

export const dynamicSchema = z.object({});

const filesSchema = z
  .object({
    privateKeys: getFilenameRefineSchema(".txt").optional(),
    addresses: getFilenameRefineSchema(".txt").optional(),
  })
  .refine(
    (data) => data.addresses || data.privateKeys,
    "Either privateKeys or addresses must be filled in.",
  );

const maxParallelAccountsSchema = z
  .number()
  .multipleOf(1)
  .positive()
  .min(1)
  .max(10);

const rpcSchema = z.object({ linea: z.string().url() });

export const fixedSchema = z.object({
  files: filesSchema,
  maxParallelAccounts: maxParallelAccountsSchema,
  delayBetweenChunkSec: z.number().multipleOf(1).positive(),
  hideBalanceLessThanUsd: z.number().multipleOf(0.001),
  rpc: rpcSchema,
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
