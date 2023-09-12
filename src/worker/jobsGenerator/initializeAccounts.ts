import Account from "../../core/account";
import isFileAvailable from "../../utils/file/isFileAvailable";
import readFileSyncByLine from "../../utils/file/readFileSyncByLine";
import randomShuffle from "../../utils/random/randomShuffle";

const initializeAccounts = (params: {
  baseFileName: string;
  isShuffle: boolean;
}) => {
  const { baseFileName, isShuffle } = params;

  const fileName = `./assets/${baseFileName}`;

  if (!isFileAvailable(fileName)) {
    throw new Error(`private keys file name ${baseFileName} is not valid`);
  }

  const allFileData = readFileSyncByLine(fileName);
  const privateKeys = allFileData.map((v) => v.trim()).filter(Boolean);

  const accounts = privateKeys.map(
    (privateKey, fileIndex) => new Account({ privateKey, fileIndex })
  );

  return isShuffle ? randomShuffle(accounts) : accounts;
};

export default initializeAccounts;
