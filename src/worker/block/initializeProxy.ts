import BlockConfig from "../../config/block";
import Proxy from "../../core/proxy";
import isFileAvailable from "../../utils/file/isFileAvailable";

type BlockConfigProxy = BlockConfig["fixed"]["proxy"];

const initializeProxy = (params: {
  proxyConfig: BlockConfigProxy;
  baseFileName: string;
  accountsLength: number;
}) => {
  const { proxyConfig, baseFileName } = params;

  const fileName = `./assets/${baseFileName}`;

  if (proxyConfig.type !== "none" && !isFileAvailable(fileName)) {
    throw new Error(`proxy file name ${fileName} is not valid`);
  }

  let proxy: Proxy | null = null;

  switch (proxyConfig.type) {
    // case "mobile": {
    //   proxy = new Proxy({
    //     type: "mobile",
    //     fileName,
    //     ipChangeUrl: proxyConfig.mobileIpChangeUrl,
    //   });
    // }
    // break;
    // case "server": {
    //   proxy = new Proxy({
    //     type: "server",
    //     fileName,
    //     isRandom: proxyConfig.serverIsRandom,
    //   });
    // }
    // break;
    case "none": {
      proxy = new Proxy({ type: "none", fileName });
      break;
    }
    default: {
      throw new Error(
        `${proxyConfig.type} proxy type not supported in block mode`
      );
    }
  }

  // const isServerRandom = proxy.isServerRandom;
  // const proxyCount = proxy.count();

  // if (isServerRandom && accountsLength !== proxyCount) {
  //   throw new Error(
  //     `number of proxies (${proxyCount}) must be equal to the number accounts ${accountsLength} if serverIsRandom === false`
  //   );
  // }

  return proxy;
};

export default initializeProxy;
