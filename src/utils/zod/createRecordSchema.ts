import { ZodTypeAny, z } from "zod";

const createRecordSchema = <
  KeyType extends string,
  ZodValueType extends ZodTypeAny,
>(
  keys: readonly KeyType[],
  zodValueType: ZodValueType,
) => {
  const rec = keys.reduce(
    (agg, k) => ({ ...agg, [k]: zodValueType }),
    {} as Record<KeyType, ZodValueType>,
  );

  return z.object(rec);
};

export default createRecordSchema;
