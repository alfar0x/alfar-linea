import path from "path";

import Encrypter from "../../core/encrypter";
import getPassword from "../other/getPassword";

import readFile from "./readFile";

const transform = (data: string) => data.split(/\r?\n/);

const readFileAndEncryptByLine = async (filePath: string) => {
  const data = readFile(filePath);

  const isEncrypted = filePath.endsWith(".encrypted.txt");

  if (!isEncrypted) return transform(data);

  const fileName = path.basename(filePath);
  const password = await getPassword(fileName);
  const encrypter = new Encrypter();
  return transform(encrypter.decrypt(password, data));
};

export default readFileAndEncryptByLine;
