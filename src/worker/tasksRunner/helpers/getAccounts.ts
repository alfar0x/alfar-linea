import Account from "../../../core/account";
import readFileByLine from "../../../utils/file/readFileByLine";

const getAccounts = (params: { baseFileName: string }) => {
  const { baseFileName } = params;

  const fileName = `./assets/${baseFileName}`;

  const allFileData = readFileByLine(fileName);
  const accountsData = allFileData.map((v) => v.trim()).filter(Boolean);

  const accounts = accountsData.map((accountData, fileIndex) => {
    const [privateKey, name] = accountData.split(";");
    return new Account({ privateKey, name, fileIndex });
  });

  return accounts;
};

export default getAccounts;
