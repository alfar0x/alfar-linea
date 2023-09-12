import { z } from "zod";

const transform = (issue: z.ZodIssue) =>
  `[${issue.path.join(".")}] ${issue.message}`;

const errorPrettify = (issues: z.ZodIssue[]) =>
  issues.map(transform).join("\n");

export default errorPrettify;
