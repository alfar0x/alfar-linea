import { z } from "zod";

import getFilenameRefine from "../../../utils/zod/getFilenameRefine";

export const dynamicSchema = z.object({});

const filesSchema = z
  .object({
    privateKeys: getFilenameRefine(".txt").optional(),
    addresses: getFilenameRefine(".txt").optional(),
  })
  .refine(
    (data) => data.addresses || data.privateKeys,
    "Either privateKeys or addresses must be filled in.",
  );

const maxParallelAccountsSchema = z.number().positive().min(1).max(10);

const rpcSchema = z.object({
  linea: z.string().url(),
});

export const fixedSchema = z.object({
  files: filesSchema,
  maxParallelAccounts: maxParallelAccountsSchema,
  delayBetweenChunkSec: z.number().positive(),
  hideBalanceLessThanUsd: z.number(),
  rpc: rpcSchema,
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
