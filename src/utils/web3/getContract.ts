import fs from "fs";
import path from "path";

import Web3, { Contract, ContractAbi } from "web3";

import { DMAIL } from "../../abi/types/DMAIL";
import { ERC_20 } from "../../abi/types/ERC_20";
import { LINEA_BANK_CORE } from "../../abi/types/LINEA_BANK_CORE";
import { LINEA_BANK_LAB_DISTRIBUTOR } from "../../abi/types/LINEA_BANK_LAB_DISTRIBUTOR";
import { SYNCSWAP_CLASSIC_POOL_FACTORY } from "../../abi/types/SYNCSWAP_CLASSIC_POOL_FACTORY";
import { SYNCSWAP_ROUTER } from "../../abi/types/SYNCSWAP_ROUTER";
import { VELOCORE_FACTORY } from "../../abi/types/VELOCORE_FACTORY";
import { VELOCORE_VAULT } from "../../abi/types/VELOCORE_VAULT";
import { WOOFI_ROUTER } from "../../abi/types/WOOFI_ROUTER";
import {
  CONTRACT_ERC_20,
  CONTRACT_SYNCSWAP_ROUTER,
  CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY,
  CONTRACT_VELOCORE_VAULT,
  CONTRACT_VELOCORE_FACTORY,
  CONTRACT_DMAIL,
  CONTRACT_WOOFI_ROUTER,
  CONTRACT_LINEA_BANK_CORE,
  CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
} from "../../constants/contracts";

export type ContractRec = {
  [CONTRACT_ERC_20]: ERC_20;
  [CONTRACT_SYNCSWAP_ROUTER]: SYNCSWAP_ROUTER;
  [CONTRACT_SYNCSWAP_CLASSIC_POOL_FACTORY]: SYNCSWAP_CLASSIC_POOL_FACTORY;
  [CONTRACT_VELOCORE_VAULT]: VELOCORE_VAULT;
  [CONTRACT_VELOCORE_FACTORY]: VELOCORE_FACTORY;
  [CONTRACT_DMAIL]: DMAIL;
  [CONTRACT_WOOFI_ROUTER]: WOOFI_ROUTER;
  [CONTRACT_LINEA_BANK_CORE]: LINEA_BANK_CORE;
  [CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR]: LINEA_BANK_LAB_DISTRIBUTOR;
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
