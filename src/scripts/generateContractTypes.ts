import path from "path";

import { runTypeChain, glob } from "typechain";

async function main() {
  const cwd = process.cwd();

  const files = glob(cwd, [`src/abi/sources/*.json`]);

  const targets = ["web3-v1", "ethers-v6"];

  console.debug({ targets, files });

  for (const target of targets) {
    for (const file of files) {
      const { name } = path.parse(file);

      await runTypeChain({
        cwd,
        filesToProcess: [file],
        allFiles: [file],
        outDir: `./src/abi/types/${target}/${name}/`,
        target,
      });
    }
  }
}

main().catch(console.error);
