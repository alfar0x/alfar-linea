import axios from "axios";
import tunnel from "tunnel";
import { z } from "zod";

import readFileAndEncryptByLine from "../utils/file/readFileAndEncryptByLine";
import createMessage from "../utils/other/createMessage";
import formatOrdinals from "../utils/other/formatOrdinals";
import logger from "../utils/other/logger";
import sleep from "../utils/other/sleep";
import randomChoice from "../utils/random/randomChoice";
import ipOrDomainSchema from "../utils/zod/ipOrDomainSchema";
import zodErrorPrettify from "../utils/zod/zodErrorPrettify";

type ProxyType = "mobile" | "none" | "server";

const proxyItemSchema = z.object({
  host: ipOrDomainSchema,
  port: z.string().transform((str) => Number(str)),
  username: z.string(),
  password: z.string(),
});

export type ProxyItem = z.infer<typeof proxyItemSchema>;

class Proxy {
  private readonly type: ProxyType;
  private readonly isRandom?: boolean;
  private readonly ipChangeUrl?: string;
  private readonly proxyList: ProxyItem[];
  private readonly onIpChangeErrorSleepSec = 30;
  private readonly onIpChangeErrorRepeatTimes = 3;
  private readonly pauseAfterIpChange = 5;

  public constructor(params: {
    type: ProxyType;
    isRandom?: boolean;
    ipChangeUrl?: string;
  }) {
    const { type, isRandom, ipChangeUrl } = params;

    this.type = type;
    this.isRandom = isRandom;
    this.ipChangeUrl = ipChangeUrl;

    this.proxyList = [];
  }

  private static parseProxyStr(proxyStr: string, index: number) {
    const [host, port, username, password] = proxyStr.split(":");

    const proxyParsed = proxyItemSchema.safeParse({
      host,
      port,
      username,
      password,
    });

    if (proxyParsed.success) return proxyParsed.data;

    const errorMessage = zodErrorPrettify(proxyParsed.error.issues);

    const indexOrd = formatOrdinals(index + 1);

    throw new Error(`${indexOrd} proxy is not valid. Details: ${errorMessage}`);
  }

  public async initializeProxy(fileName: string) {
    if (this.type === "none") return [];

    const allFileData = await readFileAndEncryptByLine(fileName);

    const fileData = allFileData.map((v) => v.trim()).filter(Boolean);

    const proxyList = fileData.map((p, i) => Proxy.parseProxyStr(p, i));

    switch (this.type) {
      case "mobile": {
        if (proxyList.length !== 1) {
          throw new Error(
            `exactly 1 proxy must be in ${fileName} for ${this.type} proxy type`,
          );
        }
        return proxyList;
      }
      case "server": {
        if (!proxyList.length) {
          throw new Error(
            `at least 1 proxy must be in ${fileName} for ${this.type} proxy type`,
          );
        }
        return proxyList;
      }
      default: {
        throw new Error(`proxy type ${this.type} is not allowed`);
      }
    }
  }

  public getHttpsTunnelByIndex(index: number) {
    const proxyItem = this.getProxyItemByIndex(index);

    if (!proxyItem) return null;

    const proxy = {
      host: proxyItem.host,
      port: proxyItem.port,
      proxyAuth: `${proxyItem.username}:${proxyItem.password}`,
    };

    return tunnel.httpsOverHttp({ proxy });
  }

  private getProxyItemByIndex(index: number) {
    switch (this.type) {
      case "none": {
        return null;
      }
      case "mobile": {
        return this.proxyList[0];
      }
      case "server": {
        if (this.isRandom) return randomChoice(this.proxyList);

        const proxyItem = this.proxyList.at(index);

        if (!proxyItem) {
          throw new Error(`unexpected error: no proxy on ${index} index`);
        }

        return proxyItem;
      }
    }
  }

  public async onProviderChange() {
    if (this.type !== "mobile") return;

    if (!this.ipChangeUrl) {
      throw new Error(`ip change url is required for ${this.type} proxy type`);
    }

    for (let retry = 0; retry < this.onIpChangeErrorRepeatTimes; retry += 1) {
      try {
        const { status } = await axios.get(this.ipChangeUrl);

        if (status !== 200)
          throw new Error(`ip change response status is ${status}`);

        logger.info(createMessage(`ip change success`));

        await sleep(this.pauseAfterIpChange);

        return;
      } catch (error) {
        const retryOrd = formatOrdinals(retry + 1);

        logger.error(
          createMessage(
            `${retryOrd} attempt to change ip failed`,
            (error as Error).message,
          ),
        );

        await sleep(this.onIpChangeErrorSleepSec);
      }
    }

    throw new Error(`ip change failed. check ip change url`);
  }

  public isServerRandom() {
    return this.type === "server" && !this.isRandom;
  }

  public count() {
    return this.proxyList.length;
  }
}

export default Proxy;
