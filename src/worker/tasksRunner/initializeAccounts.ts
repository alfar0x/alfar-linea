import Account from "../../core/account";
import readFileAndEncryptByLine from "../../utils/file/readFileAndEncryptByLine";
import randomShuffle from "../../utils/random/randomShuffle";

const initializeAccounts = async (params: {
  baseFileName: string;
  isShuffle: boolean;
}) => {
  const { baseFileName, isShuffle } = params;

  const fileName = `./assets/${baseFileName}`;

  const allFileData = await readFileAndEncryptByLine(fileName);
  const accountsData = allFileData.map((v) => v.trim()).filter(Boolean);

  const accounts = accountsData.map((accountData, fileIndex) => {
    const [privateKey, name] = accountData.split(";");
    return new Account({ privateKey, name, fileIndex });
  });

  return isShuffle ? randomShuffle(accounts) : accounts;
};

export default initializeAccounts;
