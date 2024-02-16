import { z } from "zod";

const createMinMaxObjectSchema = (
  multipleOf: number,
  min: number,
  max: number,
) => {
  return z
    .object({
      min: z.number().multipleOf(multipleOf).min(min),
      max: z.number().multipleOf(multipleOf).max(max),
    })
    .refine(
      (schema: { min: number; max: number }) => schema.max >= schema.min,
      "Max must be greater than min",
    );
};

export default createMinMaxObjectSchema;
