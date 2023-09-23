import { z } from "zod";

const evmAddressSchema = z
  .string()
  .refine((value) => /^(0x)?[0-9a-fA-F]{40}$/.test(value), {
    message: "Invalid Ethereum address format",
  })
  .transform((value) => (value.startsWith("0x") ? value : `0x${value}`));

export default evmAddressSchema;
