/* eslint-disable import/order */
import Big from "big.js";
import { Web3, HttpProvider } from "web3";

import { RawToken } from "../types";
import sleep from "../utils/other/sleep";

import CHAIN_NAMES from "../constants/chainNames";
import Token from "./token";
import { Agent } from "http";

type ChainName = (typeof CHAIN_NAMES)[number];

type ProviderOptions = NonNullable<
  ConstructorParameters<typeof HttpProvider>["1"]
>["providerOptions"] & {
  agent: Agent;
};

class Chain {
  public readonly name: ChainName;
  public readonly chainId: number;
  public readonly w3: Web3;
  public readonly tokens: Token[];

  private readonly rpc: string;
  private readonly explorer: string;
  private native: Token | null;
  private wrappedNative: Token | null;

  public constructor(params: {
    name: ChainName;
    chainId: number;
    rpc: string;
    explorer: string;
    rawTokens: RawToken[];
  }) {
    const { name, chainId, rpc, explorer, rawTokens } = params;

    this.name = name;
    this.chainId = chainId;
    this.rpc = rpc;
    this.explorer = explorer;
    this.w3 = new Web3(new HttpProvider(this.rpc));
    this.tokens = this.initializeTokens(rawTokens);
    this.native = null;
    this.wrappedNative = null;
  }

  private initializeTokens(rawTokens: RawToken[]) {
    return rawTokens.map(
      (rawToken) =>
        new Token({
          name: rawToken.name,
          address: rawToken.address,
          geskoId: rawToken.geskoId,
          chain: this,
          readableDecimals: rawToken.readableDecimals,
          type: rawToken.type,
        }),
    );
  }

  public updateHttpProviderOptions(params: {
    providerOptions: ProviderOptions;
    rpc?: string;
  }) {
    const { providerOptions, rpc = this.rpc } = params;

    const httpProvider = new HttpProvider(rpc, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      providerOptions: providerOptions as ProviderOptions as any,
    });

    this.w3.setProvider(httpProvider);
  }

  public getTokenByName(name: string) {
    const token = this.tokens.find((t) => t.name === name);
    if (!token) throw new Error(`token ${name} is not found`);

    return token;
  }

  public getNative() {
    if (!this.native) {
      const nativeList = this.tokens.filter((t) => t.isNative);

      if (!nativeList.length) {
        throw new Error(`native not found for ${this.name} chain`);
      }

      if (nativeList.length >= 2) {
        throw new Error(`too much natives for ${this.name} chain`);
      }

      this.native = nativeList[0];
    }

    return this.native;
  }

  public getWrappedNative() {
    if (!this.wrappedNative) {
      const wrappedNativeList = this.tokens.filter((t) => t.isWrappedNative);

      if (!wrappedNativeList.length) {
        throw new Error(`wrappedNative not found for ${this.name} chain`);
      }

      if (wrappedNativeList.length >= 2) {
        throw new Error(`too much wrappedNatives for ${this.name} chain`);
      }

      this.wrappedNative = wrappedNativeList[0];
    }

    return this.wrappedNative;
  }

  public isEquals(chain: Chain) {
    return this.chainId === chain.chainId;
  }

  public async getSwapDeadline(sec = 1800) {
    const lastBlock = await this.w3.eth.getBlock("latest");
    const currentTimestamp = lastBlock.timestamp;

    return Big(currentTimestamp.toString()).plus(sec).toNumber();
  }

  public toString() {
    return this.name;
  }

  public getHashLink(hash: string) {
    return `${this.explorer}/tx/${hash}`;
  }

  public waitTxReceipt = async (hash: string) => {
    let retry = 100;

    const successStatus = 1n;

    while ((retry -= 1)) {
      const transactionReceipt = await this.w3.eth.getTransactionReceipt(hash);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (transactionReceipt) {
        if (transactionReceipt.status === successStatus) {
          return transactionReceipt;
        }

        const txLink = this.getHashLink(hash);
        throw new Error(`transaction was failed: ${txLink}`);
      }

      await sleep(2);
    }

    const txLink = this.getHashLink(hash);

    throw new Error(`waiting for tx status time out: ${txLink}`);
  };
}

export default Chain;
