import { z } from "zod";

const evmPrivateKeySchema = z
  .string()
  .refine((value) => /^(0x)?[0-9a-fA-F]{64}$/.test(value), {
    message: "Invalid Ethereum private key format",
  })
  .transform((value) => (value.startsWith("0x") ? value : `0x${value}`));

export default evmPrivateKeySchema;
