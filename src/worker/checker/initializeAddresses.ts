import Account from "../../core/account";
import readFileAndEncryptByLine from "../../utils/file/readFileAndEncryptByLine";

const initializeAddresses = async (params: {
  privateKeysFileName?: string;
  addressesFileName?: string;
}) => {
  const { privateKeysFileName, addressesFileName } = params;

  if (addressesFileName) {
    const fileName = `./assets/${addressesFileName}`;

    return await readFileAndEncryptByLine(fileName);
  }

  if (!privateKeysFileName) {
    throw new Error("Either privateKeys or addresses must be filled in.");
  }

  const fileName = `./assets/${privateKeysFileName}`;

  const privateKeys = await readFileAndEncryptByLine(fileName);

  return privateKeys.map(
    (privateKey, fileIndex) => new Account({ privateKey, fileIndex }).address
  );
};

export default initializeAddresses;
