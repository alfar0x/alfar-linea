import { z } from "zod";
import readFileSyncByLine from "../utils/readFileSyncByLine";
import randomChoice from "../utils/randomChoice";
import axios from "axios";
import logger from "../common/logger";
import sleep from "../common/sleep";
import getMyIp from "../utils/getMyIp";

type ProxyType = "none" | "server" | "mobile";

const proxyItemSchema = z.object({
  host: z.string().ip(),
  port: z.string().transform((str) => Number(str)),
  username: z.string(),
  password: z.string(),
});

const proxySchema = z.string().transform((str) => {
  const [host, port, username, password] = str.split(":");
  return proxyItemSchema.parse({ host, port, username, password });
});

export type ProxyItem = z.infer<typeof proxySchema>;

class Proxy {
  private type: ProxyType;
  private isRandom?: boolean;
  private ipChangeUrl?: string;
  private proxyList: ProxyItem[];
  private onIpChangeUrlSleepSec: number;
  private onIpChangeErrorRepeatTimes: number;

  constructor(params: {
    type: ProxyType;
    fileName: string;
    isRandom?: boolean;
    ipChangeUrl?: string;
  }) {
    const { type, fileName, isRandom, ipChangeUrl } = params;

    this.type = type;
    this.isRandom = isRandom;
    this.ipChangeUrl = ipChangeUrl;
    this.onIpChangeUrlSleepSec = 30;
    this.onIpChangeErrorRepeatTimes = 3;

    this.proxyList = this.initializeProxy(fileName);
  }

  private initializeProxy(fileName: string) {
    if (this.type === "none") return [];

    const fileData = readFileSyncByLine(fileName);
    const proxyList = fileData.map((proxyStr) => proxySchema.parse(proxyStr));

    switch (this.type) {
      case "mobile": {
        if (proxyList.length !== 1) {
          throw new Error(
            `only 1 proxy must be in ${fileName} for ${this.type} proxy type`
          );
        }
        return proxyList;
      }
      case "server": {
        if (!proxyList.length) {
          throw new Error(
            `at least 1 proxy must be in ${fileName} for ${this.type} proxy type`
          );
        }
        return proxyList;
      }
      default: {
        throw new Error(`proxy type ${this.type} is not allowed`);
      }
    }
  }

  public proxyListLength() {
    return this.proxyList.length;
  }

  public getTunnelOptionsByIndex(index: number) {
    const proxyItem = this.getProxyItemByIndex(index);
    if (!proxyItem) return;

    return {
      host: proxyItem.host,
      port: proxyItem.port,
      proxyAuth: `${proxyItem.username}:${proxyItem.password}`,
    };
  }

  private getProxyItemByIndex(index: number) {
    switch (this.type) {
      case "none": {
        return undefined;
      }

      case "mobile": {
        return this.proxyList[0];
      }

      case "server": {
        if (this.isRandom) {
          return randomChoice(this.proxyList);
        }

        const proxy = this.proxyList[index];

        if (!proxy) {
          throw new Error(`no proxy on ${index} index`);
        }

        return proxy;
      }
    }
  }

  public async postRequest() {
    if (this.type !== "mobile") return false;

    if (!this.ipChangeUrl) {
      throw new Error(`ip change url is required for ${this.type} proxy type`);
    }

    for (let retry = 0; retry < this.onIpChangeErrorRepeatTimes; retry++) {
      try {
        const { status } = await axios.get(this.ipChangeUrl);

        if (status === 200) {
          const myIp = await getMyIp();
          logger.info(`ip changed successfully: ${myIp}`);
          return true;
        }

        throw new Error(`ip change response status is ${status}`);
      } catch (error) {
        logger.error(
          `Attempt ${retry + 1} failed: ${(error as Error).message}`
        );

        await sleep(this.onIpChangeUrlSleepSec);
      }
    }

    throw new Error(
      `all ${this.onIpChangeErrorRepeatTimes} attempts to change ip failed. Please check ip change url`
    );
  }

  isServerRandom() {
    return this.type === "server" && !this.isRandom;
  }

  count() {
    return this.proxyList.length;
  }
}

export default Proxy;
