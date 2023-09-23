import Proxy from "../../core/proxy";
import isFileAvailable from "../../utils/file/isFileAvailable";

import TasksRunnerConfig from "./config";

type TasksRunnerConfigProxy = TasksRunnerConfig["fixed"]["proxy"];

const initializeProxy = async (params: {
  proxyConfig: TasksRunnerConfigProxy;
  baseFileName: string;
  accountsLength: number;
}) => {
  const { proxyConfig, baseFileName, accountsLength } = params;

  const folder = "./assets";
  const fileName = `${folder}/${baseFileName}`;

  if (proxyConfig.type !== "none" && !isFileAvailable(fileName)) {
    throw new Error(
      `proxy file name ${fileName} is not valid. Check ${folder} folder`,
    );
  }

  let proxy: Proxy | null = null;

  switch (proxyConfig.type) {
    case "mobile": {
      proxy = new Proxy({
        type: "mobile",
        ipChangeUrl: proxyConfig.mobileIpChangeUrl,
      });
      break;
    }
    case "server": {
      proxy = new Proxy({
        type: "server",
        isRandom: proxyConfig.serverIsRandom,
      });
      break;
    }
    case "none": {
      proxy = new Proxy({ type: "none" });
      break;
    }
  }

  const isServerRandom = proxy.isServerRandom();
  const proxyCount = proxy.count();

  if (isServerRandom && accountsLength !== proxyCount) {
    throw new Error(
      `number of proxies (${proxyCount}) must be equal to the number accounts ${accountsLength} if serverIsRandom is false`,
    );
  }

  await proxy.initializeProxy(fileName);

  return proxy;
};

export default initializeProxy;
