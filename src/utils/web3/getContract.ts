import fs from "fs";
import path from "path";

import Web3, { Contract, ContractAbi } from "web3";

import { Dmail } from "../../abi/types/web3-v1/Dmail";
import { EchoDexRouter } from "../../abi/types/web3-v1/EchoDexRouter";
import { Erc20 } from "../../abi/types/web3-v1/Erc20";
import { LineaBankCore } from "../../abi/types/web3-v1/LineaBankCore";
import { LineaBankLabDistributor } from "../../abi/types/web3-v1/LineaBankLabDistributor";
import { PancakeFactory } from "../../abi/types/web3-v1/PancakeFactory";
import { PancakeQuote } from "../../abi/types/web3-v1/PancakeQuote";
import { PancakeSwapRouter } from "../../abi/types/web3-v1/PancakeSwapRouter";
import { SyncswapClassicPoolFactory } from "../../abi/types/web3-v1/SyncswapClassicPoolFactory";
import { SyncswapRouter } from "../../abi/types/web3-v1/SyncswapRouter";
import { VelocoreFactory } from "../../abi/types/web3-v1/VelocoreFactory";
import { VelocoreVault } from "../../abi/types/web3-v1/VelocoreVault";
import { WoofiRouter } from "../../abi/types/web3-v1/WoofiRouter";
import {
  CONTRACT_DMAIL,
  CONTRACT_ECHO_DEX_ROUTER,
  CONTRACT_ERC_20,
  CONTRACT_LINEA_BANK_CORE,
  CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
  CONTRACT_PANCAKE_FACTORY,
  CONTRACT_PANCAKE_QUOTE,
  CONTRACT_PANCAKE_SWAP_ROUTER,
  CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY,
  CONTRACT_SYNCSWAP_ROUTER,
  CONTRACT_VELOCORE_FACTORY,
  CONTRACT_VELOCORE_VAULT,
  CONTRACT_WOOFI_ROUTER,
} from "../../constants/contracts";

export type ContractRec = {
  [CONTRACT_DMAIL]: Dmail;
  [CONTRACT_ECHO_DEX_ROUTER]: EchoDexRouter;
  [CONTRACT_ERC_20]: Erc20;
  [CONTRACT_LINEA_BANK_CORE]: LineaBankCore;
  [CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR]: LineaBankLabDistributor;
  [CONTRACT_PANCAKE_FACTORY]: PancakeFactory;
  [CONTRACT_PANCAKE_QUOTE]: PancakeQuote;
  [CONTRACT_PANCAKE_SWAP_ROUTER]: PancakeSwapRouter;
  [CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY]: SyncswapClassicPoolFactory;
  [CONTRACT_SYNCSWAP_ROUTER]: SyncswapRouter;
  [CONTRACT_VELOCORE_FACTORY]: VelocoreFactory;
  [CONTRACT_VELOCORE_VAULT]: VelocoreVault;
  [CONTRACT_WOOFI_ROUTER]: WoofiRouter;
};

const getContract = <C extends keyof ContractRec>(args: {
  w3: Web3;
  name: C;
  address: string;
}) => {
  const { w3, name, address } = args;

  const abiPath = path.join("./src/abi/sources/", `${name}.json`);

  const abiStr = fs.readFileSync(abiPath, { encoding: "utf-8" });

  const abi = JSON.parse(abiStr) as ContractAbi;

  const checksumAddress = Web3.utils.toChecksumAddress(address.toUpperCase());

  const contract = new Contract(
    abi,
    checksumAddress,
    w3
  ) as unknown as ContractRec[typeof name];

  return contract;
};

export default getContract;
