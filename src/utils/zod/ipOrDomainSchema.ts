import { z } from "zod";

const ipOrDomainPattern =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.?)+(?:[A-Za-z]{2,6})$/;

const ipOrDomainSchema = z
  .string()
  .refine((value) => ipOrDomainPattern.test(value), {
    message: "Invalid IP or domain format",
  });

export default ipOrDomainSchema;
