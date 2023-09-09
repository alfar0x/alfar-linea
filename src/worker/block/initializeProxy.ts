import BlockConfig from "../../config/block";
import Proxy from "../../core/proxy";
import isFileAvailable from "../../utils/file/isFileAvailable";

type BlockConfigProxy = BlockConfig["fixed"]["proxy"];

const initializeProxy = (params: {
  proxyConfig: BlockConfigProxy;
  baseFileName: string;
}) => {
  const { proxyConfig, baseFileName } = params;

  const fileName = `./assets/${baseFileName}`;

  if (proxyConfig.type !== "none" && !isFileAvailable(fileName)) {
    throw new Error(`proxy file name ${fileName} is not valid`);
  }

  switch (proxyConfig.type) {
    // case "mobile": {
    //   return new Proxy({
    //     type: "mobile",
    //     fileName,
    //     ipChangeUrl: proxyConfig.mobileIpChangeUrl,
    //   });
    // }
    // case "server": {
    //   return new Proxy({
    //     type: "server",
    //     fileName,
    //     isRandom: proxyConfig.serverIsRandom,
    //   });
    // }
    case "none": {
      return new Proxy({ type: "none", fileName });
    }
    default: {
      throw new Error(
        `${proxyConfig.type} proxy type not supported in block mode`
      );
    }
  }
};

export default initializeProxy;
