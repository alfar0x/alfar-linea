/* Autogenerated file. Do not edit manually. */
import fs from "fs";
import path from "path";
import Web3, { Contract, ContractAbi } from "web3";

import { Dmail } from "../types/web3-v1/Dmail";
import { EchoDexSmartRouter } from "../types/web3-v1/EchoDexSmartRouter";
import { Erc20 } from "../types/web3-v1/Erc20";
import { LineaBankCore } from "../types/web3-v1/LineaBankCore";
import { LineaBankLabDistributor } from "../types/web3-v1/LineaBankLabDistributor";
import { PancakeFactory } from "../types/web3-v1/PancakeFactory";
import { PancakeQuote } from "../types/web3-v1/PancakeQuote";
import { PancakeSwapRouter } from "../types/web3-v1/PancakeSwapRouter";
import { SyncswapClassicPoolFactory } from "../types/web3-v1/SyncswapClassicPoolFactory";
import { SyncswapRouter } from "../types/web3-v1/SyncswapRouter";
import { VelocoreFactory } from "../types/web3-v1/VelocoreFactory";
import { VelocoreVault } from "../types/web3-v1/VelocoreVault";
import { WoofiRouter } from "../types/web3-v1/WoofiRouter";

type ContractRec = {
  Dmail: Dmail;
  EchoDexSmartRouter: EchoDexSmartRouter;
  Erc20: Erc20;
  LineaBankCore: LineaBankCore;
  LineaBankLabDistributor: LineaBankLabDistributor;
  PancakeFactory: PancakeFactory;
  PancakeQuote: PancakeQuote;
  PancakeSwapRouter: PancakeSwapRouter;
  SyncswapClassicPoolFactory: SyncswapClassicPoolFactory;
  SyncswapRouter: SyncswapRouter;
  VelocoreFactory: VelocoreFactory;
  VelocoreVault: VelocoreVault;
  WoofiRouter: WoofiRouter;
};

const getWeb3Contract = <C extends keyof ContractRec>(name: C) => {
  const abiPath = path.join(`./src/abi/sources/${name}.json`);

  const abiStr = fs.readFileSync(abiPath, { encoding: "utf-8" });

  const abi = JSON.parse(abiStr) as ContractAbi;

  return (w3: Web3, address: string) => {
    const checksumAddress = Web3.utils.toChecksumAddress(address.toUpperCase());

    return new Contract(
      abi,
      checksumAddress,
      w3,
    ) as unknown as ContractRec[typeof name];
  };
};

export default getWeb3Contract;
