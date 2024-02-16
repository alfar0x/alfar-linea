import readFileByLine from "../../../utils/file/readFileByLine";

const getProxies = (params: {
  baseFileName: string;
  accountsLength: number;
  isServerRandom: boolean;
}) => {
  const { baseFileName, accountsLength, isServerRandom } = params;

  const fileName = `./assets/${baseFileName}`;

  const allFileData = readFileByLine(fileName);
  const proxies = allFileData.map((v) => v.trim()).filter(Boolean);

  const proxiesLength = proxies.length;

  if (isServerRandom && accountsLength !== proxiesLength) {
    throw new Error(
      `number of proxies (${proxiesLength}) must be equal to the number accounts ${accountsLength} if serverIsRandom is false`,
    );
  }

  return proxies;
};

export default getProxies;
