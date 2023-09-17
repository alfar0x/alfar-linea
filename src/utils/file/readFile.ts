import fs from "fs";
import path from "path";

import isFileAvailable from "./isFileAvailable";

const readFile = (filePath: string) => {
  if (!isFileAvailable(filePath)) {
    const fileName = path.basename(filePath);
    const folderName = path.dirname(filePath);
    throw new Error(
      `file name ${fileName} is not valid. Check ${folderName} folder`,
    );
  }

  return fs.readFileSync(filePath, "utf-8");
};

export default readFile;
