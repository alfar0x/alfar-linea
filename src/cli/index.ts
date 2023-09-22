import fs from "fs";
import path from "path";

import prompts from "prompts";

import greetingsStr from "../utils/other/greetingsStr";
import logger from "../utils/other/logger";
import sleep from "../utils/other/sleep";

const modeChoices = [
  {
    title: "task runner",
    value: "task-runner",
    description: "run random linea transactions",
  },
  {
    title: "checker",
    value: "checker",
    description: "check your wallets analytics",
  },
  {
    title: "encrypter",
    value: "encrypter",
    description: "encrypt your private keys to use task runner on server",
  },
  {
    title: "eth returner",
    value: "reset",
    description: "return all tokens/pools to eth",
    disabled: true,
  },
  {
    title: "depositor",
    value: "depositor",
    description: "okx to linea",
    disabled: true,
  },
];

type Mode = "task-runner" | "reset" | "depositor" | "checker" | "encrypter";

class Cli {
  private configPath = "config";

  private getConfigChoices() {
    try {
      const fileNames = fs.readdirSync(this.configPath);

      const choices = fileNames
        .filter((filename) => !filename.endsWith(".example.json5"))
        .map((filename) => ({
          title: filename,
          value: `${this.configPath}/${path.basename(filename)}`,
        }));

      if (!choices.length)
        throw new Error(
          `add at least 1 valid config (examples is not valid). Check config folder`,
        );

      return choices;
    } catch (error) {
      logger.error((error as Error).message);
      process.exit();
    }
  }

  public async run() {
    // eslint-disable-next-line no-console
    console.info(greetingsStr);
    await sleep(2);
    const response = await prompts([
      {
        type: "select",
        name: "mode",
        message: "select your mode",
        choices: modeChoices,
      },
      {
        type: "autocomplete",
        name: "config",
        message: "pick a config file",
        choices: this.getConfigChoices(),
      },
    ]);

    return { mode: response.mode as Mode, config: response.config };
  }
}

export default Cli;
