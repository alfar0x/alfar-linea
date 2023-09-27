import { z } from "zod";

import getFilenameRefineSchema from "../../../utils/zod/getFilenameRefineSchema";

export const dynamicSchema = z.object({});

export const fixedSchema = z.object({
  decryptedFileName: getFilenameRefineSchema(".txt"),
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
