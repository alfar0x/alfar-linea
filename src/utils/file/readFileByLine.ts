import readFile from "./readFile";

const readFileSyncByLine = (filePath: string) => {
  return readFile(filePath).split(/\r?\n/);
};

export default readFileSyncByLine;
