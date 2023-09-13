import { z } from "zod";

import getFilenameRefine from "../../utils/zod/getFilenameRefine";

export const dynamicSchema = z.object({});

export const fixedSchema = z.object({
  decryptedFileName: getFilenameRefine(".txt"),
});

const schema = z.object({ fixed: fixedSchema, dynamic: dynamicSchema });

export default schema;
