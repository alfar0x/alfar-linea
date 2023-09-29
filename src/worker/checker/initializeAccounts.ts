import Account from "../../core/account";
import readFileAndEncryptByLine from "../../utils/file/readFileAndEncryptByLine";

const initializeAccounts = async (params: {
  privateKeysFileName?: string;
  addressesFileName?: string;
}) => {
  const { privateKeysFileName, addressesFileName } = params;

  const accounts: Account[] = [];

  if (addressesFileName) {
    const fileName = `./assets/${addressesFileName}`;

    const accountsData = await readFileAndEncryptByLine(fileName);

    const addressesAccounts = accountsData.map((accountData, fileIndex) => {
      const [address, name] = accountData.split(";");

      return new Account({ name, address, fileIndex });
    });

    accounts.push(...addressesAccounts);
  }

  if (privateKeysFileName) {
    const fileName = `./assets/${privateKeysFileName}`;

    const accountsData = await readFileAndEncryptByLine(fileName);

    const prKeysAccounts = accountsData.map((accountData, fileIndex) => {
      const [privateKey, name] = accountData.split(";");

      return new Account({ name, privateKey, fileIndex });
    });

    accounts.push(...prKeysAccounts);
  }

  return accounts;
};

export default initializeAccounts;
