import readFile from "./readFile";

const readFileByLine = (filePath: string) => readFile(filePath).split(/\r?\n/);

export default readFileByLine;
