import fs from "fs";
import path from "path";

import Web3, { Contract, ContractAbi } from "web3";

import { DMAIL } from "../../abi/types/DMAIL";
import { ERC_20 } from "../../abi/types/ERC_20";
import { SYNC_SWAP_CLASSIC_POOL_FACTORY } from "../../abi/types/SYNC_SWAP_CLASSIC_POOL_FACTORY";
import { SYNC_SWAP_ROUTER } from "../../abi/types/SYNC_SWAP_ROUTER";
import { VELOCORE_FACTORY } from "../../abi/types/VELOCORE_FACTORY";
import { VELOCORE_VAULT } from "../../abi/types/VELOCORE_VAULT";
import {
  CONTRACT_ERC_20,
  CONTRACT_SYNC_SWAP_ROUTER,
  CONTRACT_SYNC_SWAP_CLASSIC_POOL_FACTORY,
  CONTRACT_VELOCORE_VAULT,
  CONTRACT_VELOCORE_FACTORY,
  CONTRACT_DMAIL,
} from "../../constants";

export type ContractRec = {
  [CONTRACT_ERC_20]: ERC_20;
  [CONTRACT_SYNC_SWAP_ROUTER]: SYNC_SWAP_ROUTER;
  [CONTRACT_SYNC_SWAP_CLASSIC_POOL_FACTORY]: SYNC_SWAP_CLASSIC_POOL_FACTORY;
  [CONTRACT_VELOCORE_VAULT]: VELOCORE_VAULT;
  [CONTRACT_VELOCORE_FACTORY]: VELOCORE_FACTORY;
  [CONTRACT_DMAIL]: DMAIL;
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
