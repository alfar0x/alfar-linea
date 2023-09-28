import fs from "fs";
import path from "path";

import fillGetEthersInterface from "./fillGetEthersInterface";
import fillGetWeb3Contract from "./fillGetWeb3Contract";
import fillTypes from "./fillTypes";

const mainFolder = "./src/abi";

const folders = {
  sources: `${mainFolder}/sources`,
  methods: `${mainFolder}/methods`,
  types: `${mainFolder}/types`,
};

const files = {
  getWeb3Contract: `${folders.methods}/getWeb3Contract.ts`,
  getEthersInterface: `${folders.methods}/getEthersInterface.ts`,
};

const main = async () => {
  await fillTypes({
    sourcesFolder: folders.sources,
    outputFolder: folders.types,
  });

  const sources = fs
    .readdirSync(folders.sources)
    .map((file) => path.parse(file).name);

  fs.mkdirSync(folders.methods, { recursive: true });

  fillGetEthersInterface({ sources, outputFile: files.getEthersInterface });
  fillGetWeb3Contract({ sources, outputFile: files.getWeb3Contract });
};

void main();
