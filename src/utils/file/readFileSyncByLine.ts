import fs from "fs";

const readFileSyncByLine = (filePath: string) => {
  const data = fs.readFileSync(filePath, "utf-8");
  return data.split(/\r?\n/);
};

export default readFileSyncByLine;
