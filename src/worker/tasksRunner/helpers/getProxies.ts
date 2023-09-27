import readFileAndEncryptByLine from "../../../utils/file/readFileAndEncryptByLine";

const getProxies = async (params: {
  baseFileName: string;
  accountsLength: number;
  isServerRandom: boolean;
}) => {
  const { baseFileName, accountsLength, isServerRandom } = params;

  const fileName = `./assets/${baseFileName}`;

  const allFileData = await readFileAndEncryptByLine(fileName);
  const proxies = allFileData.map((v) => v.trim()).filter(Boolean);

  const proxiesLength = proxies.length;

  if (!isServerRandom && accountsLength !== proxiesLength) {
    throw new Error(
      `number of proxies (${proxiesLength}) must be equal to the number accounts ${accountsLength} if serverIsRandom is false`,
    );
  }

  return proxies;
};

export default getProxies;
