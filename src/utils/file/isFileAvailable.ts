import fs from "fs";

const isFileAvailable = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

export default isFileAvailable;
