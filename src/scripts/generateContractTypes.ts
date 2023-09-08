import { runTypeChain, glob } from "typechain";
import path from "path";

async function main() {
  const cwd = process.cwd();

  const allFiles = glob(cwd, [`src/abi/sources/*.json`]);
  console.debug(allFiles);

  for (const file of allFiles) {
    const { name } = path.parse(file);

    await runTypeChain({
      cwd,
      filesToProcess: [file],
      allFiles: [file],
      outDir: `./src/abi/types/${name}/`,
      target: "web3-v1",
    });
  }
}

main().catch(console.error);
