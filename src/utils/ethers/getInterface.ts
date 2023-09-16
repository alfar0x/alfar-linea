import fs from "fs";
import path from "path";

import { ethers } from "ethers";

import { DmailInterface } from "../../abi/types/ethers-v6/Dmail/Dmail";
import { EchoDexRouterInterface } from "../../abi/types/ethers-v6/EchoDexRouter/EchoDexRouter";
import { Erc20Interface } from "../../abi/types/ethers-v6/Erc20/Erc20";
import { LineaBankCoreInterface } from "../../abi/types/ethers-v6/LineaBankCore/LineaBankCore";
import { LineaBankLabDistributorInterface } from "../../abi/types/ethers-v6/LineaBankLabDistributor/LineaBankLabDistributor";
import { PancakeFactoryInterface } from "../../abi/types/ethers-v6/PancakeFactory/PancakeFactory";
import { PancakeQuoteInterface } from "../../abi/types/ethers-v6/PancakeQuote/PancakeQuote";
import { PancakeSwapRouterInterface } from "../../abi/types/ethers-v6/PancakeSwapRouter/PancakeSwapRouter";
import { SyncswapClassicPoolFactoryInterface } from "../../abi/types/ethers-v6/SyncswapClassicPoolFactory/SyncswapClassicPoolFactory";
import { SyncswapRouterInterface } from "../../abi/types/ethers-v6/SyncswapRouter/SyncswapRouter";
import { VelocoreFactoryInterface } from "../../abi/types/ethers-v6/VelocoreFactory/VelocoreFactory";
import { VelocoreVaultInterface } from "../../abi/types/ethers-v6/VelocoreVault/VelocoreVault";
import { WoofiRouterInterface } from "../../abi/types/ethers-v6/WoofiRouter/WoofiRouter";
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
  [CONTRACT_DMAIL]: DmailInterface;
  [CONTRACT_ECHO_DEX_ROUTER]: EchoDexRouterInterface;
  [CONTRACT_ERC_20]: Erc20Interface;
  [CONTRACT_LINEA_BANK_CORE]: LineaBankCoreInterface;
  [CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR]: LineaBankLabDistributorInterface;
  [CONTRACT_PANCAKE_FACTORY]: PancakeFactoryInterface;
  [CONTRACT_PANCAKE_QUOTE]: PancakeQuoteInterface;
  [CONTRACT_PANCAKE_SWAP_ROUTER]: PancakeSwapRouterInterface;
  [CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY]: SyncswapClassicPoolFactoryInterface;
  [CONTRACT_SYNCSWAP_ROUTER]: SyncswapRouterInterface;
  [CONTRACT_VELOCORE_FACTORY]: VelocoreFactoryInterface;
  [CONTRACT_VELOCORE_VAULT]: VelocoreVaultInterface;
  [CONTRACT_WOOFI_ROUTER]: WoofiRouterInterface;
};

const getInterface = <C extends keyof ContractRec>(args: { name: C }) => {
  const { name } = args;

  const abiPath = path.join("./src/abi/sources/", `${name}.json`);

  const abiStr = fs.readFileSync(abiPath, { encoding: "utf-8" });

  const contract = new ethers.Interface(
    abiStr
  ) as unknown as ContractRec[typeof name];

  return contract;
};

export default getInterface;
