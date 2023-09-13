import { z } from "zod";

const getFilenameRefine = (ext: string) => {
  const exampleExt = `.example.${ext}`;

  return z
    .string()
    .refine(
      (filename) => !filename.endsWith(exampleExt),
      `Files with ending '${exampleExt}' cannot be used. Create new file`
    )
    .refine(
      (filename) => filename.endsWith(ext),
      `Files must ends with '${ext}'`
    );
};

export default getFilenameRefine;
