import fs from "fs";
import path from "path";

import Encrypter from "../../core/encrypter";
import getPassword from "../../utils/cli/getPassword";
import readFile from "../../utils/file/readFile";
import logger from "../../utils/other/logger";

import EncrypterConfig from "./config";

class EncrypterWorker {
  private readonly config: EncrypterConfig;

  public constructor(configFileName: string) {
    this.config = new EncrypterConfig({ configFileName });
  }

  public async run() {
    const password = await getPassword();

    const { decryptedFileName } = this.config.fixed;

    const fullFileName = `./assets/${decryptedFileName}`;

    const decryptedData = readFile(fullFileName);

    const encrypter = new Encrypter();

    const encrypted = encrypter.encrypt(password, decryptedData);

    const fileInfo = path.parse(decryptedFileName);

    const fileNameWithoutExtension = fileInfo.name;

    const fileName = `./assets/${fileNameWithoutExtension}.encrypted.txt`;

    fs.writeFileSync(fileName, encrypted, { encoding: "utf-8" });

    logger.info(`Successfully encrypted to ${fileName}`);
  }
}

export default EncrypterWorker;
