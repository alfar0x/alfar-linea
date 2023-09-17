/* eslint-disable no-magic-numbers */
/* eslint-disable func-style */
import { Primitive, z, ZodLiteral, ZodNever } from "zod";

type MappedZodLiterals<T extends readonly Primitive[]> = {
  -readonly [K in keyof T]: ZodLiteral<T[K]>;
};

function createManyUnion<
  A extends Readonly<[Primitive, Primitive, ...Primitive[]]>,
>(literals: A) {
  return z.union(
    literals.map((value) => z.literal(value)) as MappedZodLiterals<A>,
  );
}

export default function createUnionSchema<T extends readonly []>(
  // eslint-disable-next-line no-unused-vars
  values: T,
): ZodNever;

export default function createUnionSchema<T extends readonly [Primitive]>(
  // eslint-disable-next-line no-unused-vars
  values: T,
): ZodLiteral<T[0]>;

export default function createUnionSchema<
  T extends readonly [Primitive, Primitive, ...Primitive[]],
  // eslint-disable-next-line no-unused-vars
>(values: T): z.ZodUnion<MappedZodLiterals<T>>;

export default function createUnionSchema<T extends readonly Primitive[]>(
  values: T,
) {
  if (values.length > 1) {
    return createManyUnion(
      values as typeof values & [Primitive, Primitive, ...Primitive[]],
    );
  } else if (values.length === 1) {
    return z.literal(values[0]);
  } else if (values.length === 0) {
    return z.never();
  }
  throw new Error("array must have a length");
}
