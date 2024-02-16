import { z } from "zod";

import getFilenameRefineSchema from "../../../utils/zod/getFilenameRefineSchema";
import createRecordSchema from "../../../utils/zod/createRecordSchema";
import CHAIN_NAMES from "../../../constants/chainNames";
import createMinMaxObjectSchema from "../../../utils/zod/createMinMaxObjectSchema";

const number = (multipleOf: number, min: number, max: number) =>
  z.number().multipleOf(multipleOf).min(min).max(max);

const dynamicChainsSchema = createRecordSchema(
  CHAIN_NAMES,
  z.object({
    maxGwei: number(0.01, 0.01, 100),
    maxTxFeeUsd: number(0.1, 0.1, 100),
  }),
);

const delaySecSchema = z.object({
  transaction: createMinMaxObjectSchema(1, 20, 600),
  step: createMinMaxObjectSchema(1, 60, 7 * 24 * 60 * 60),
});

export const dynamicSchema = z.object({
  delaySec: delaySecSchema,
  chains: dynamicChainsSchema,
  maxParallelAccounts: number(1, 1, 10),
});

const fixedChainsSchema = createRecordSchema(
  CHAIN_NAMES,
  z
    .object({
      minWorkNativeBalance: number(0.0001, 0.0001, 100000),
      minRescueNativeBalance: number(0.0001, 0.0001, 100000),
      rpc: z.string().url(),
    })
    .refine(
      (schema: {
        minWorkNativeBalance: number;
        minRescueNativeBalance: number;
      }) => schema.minRescueNativeBalance > schema.minWorkNativeBalance,
      "minRescueNativeBalance must be greater or equals than minWorkNativeBalance",
    ),
);

const transactionsLimitSchema = createMinMaxObjectSchema(1, 1, 10000);

const filesSchema = z.object({
  privateKeys: getFilenameRefineSchema(".txt"),
  proxies: getFilenameRefineSchema(".txt"),
  operations: getFilenameRefineSchema(".txt"),
});

const workingAmountPercentSchema = createMinMaxObjectSchema(0.1, 0.1, 30);

const onCurrentTaskEndSchema = z.union([
  z.literal("CREATE_NEXT_TASK"),
  z.literal("WAIT_OTHER"),
  z.literal("MOVE_RANDOMLY"),
]);

const approveMultiplierSchema = createMinMaxObjectSchema(1, 1, 1000);

export const fixedSchema = z.object({
  approveMultiplier: approveMultiplierSchema,
  files: filesSchema,
  maxAccountFeeUsd: number(0.01, 1, 1000),
  onCurrentTaskEnd: onCurrentTaskEndSchema,
  chains: fixedChainsSchema,
  isRandomProxy: z.boolean(),
  transactionsLimit: transactionsLimitSchema,
  workingAmountPercent: workingAmountPercentSchema,
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
