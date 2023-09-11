import Account from "../../core/account";
import isFileAvailable from "../../utils/file/isFileAvailable";
import readFileSyncByLine from "../../utils/file/readFileSyncByLine";

const initializeAddresses = (params: {
  privateKeysFileName?: string;
  addressesFileName?: string;
}) => {
  const { privateKeysFileName, addressesFileName } = params;

  if (addressesFileName) {
    const fileName = `./assets/${addressesFileName}`;

    if (!isFileAvailable(fileName)) {
      throw new Error(`addresses file name ${addressesFileName} is not valid`);
    }

    return readFileSyncByLine(fileName);
  }

  if (!privateKeysFileName) {
    throw new Error("Either privateKeys or addresses must be filled in.");
  }

  const fileName = `./assets/${privateKeysFileName}`;

  if (!isFileAvailable(fileName)) {
    throw new Error(
      `private keys file name ${privateKeysFileName} is not valid`
    );
  }

  const privateKeys = readFileSyncByLine(fileName);

  return privateKeys.map(
    (privateKey, fileIndex) => new Account({ privateKey, fileIndex }).address
  );
};

export default initializeAddresses;
