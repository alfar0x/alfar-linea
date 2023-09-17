/* eslint-disable no-console */
import path from "path";

import { runTypeChain, glob } from "typechain";

const fillTypes = async (params: {
  sourcesFolder: string;
  outputFolder: string;
}) => {
  const { sourcesFolder, outputFolder } = params;

  const cwd = process.cwd();

  const abis = glob(cwd, [`${sourcesFolder}/*.json`]);

  const targets = ["web3-v1", "ethers-v6"];

  console.debug({ targets, abis });

  for (const target of targets) {
    for (const file of abis) {
      const { name } = path.parse(file);

      await runTypeChain({
        cwd,
        filesToProcess: [file],
        allFiles: [file],
        outDir: `${outputFolder}/${target}/${name}/`,
        target,
      });
    }
  }
};

export default fillTypes;
