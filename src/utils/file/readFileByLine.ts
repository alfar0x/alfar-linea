import readFile from "./readFile";

const readFileSyncByLine = (filePath: string) =>
  readFile(filePath).split(/\r?\n/);

export default readFileSyncByLine;
