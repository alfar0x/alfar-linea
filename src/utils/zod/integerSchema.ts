import { z } from "zod";

const integerSchema = z.number().refine((value) => Number.isInteger(value), {
  message: "Value should be an integer.",
});

export default integerSchema;
