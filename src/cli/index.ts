import fs from "fs";
import path from "path";

import prompts from "prompts";

import greetingsStr from "../utils/other/greetingsStr";
import logger from "../utils/other/logger";
import sleep from "../utils/other/sleep";

const modeChoices = [
  {
    title: "job generator",
    value: "job-generator",
    description: "run random linea transactions",
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
  {
    title: "checker",
    value: "checker",
    description: "check your wallets analytics",
    disabled: true,
  },
  {
    title: "config creator",
    value: "config-creator",
    description: "create config to any mode",
    disabled: true,
  },
];

type Mode =
  | "job-generator"
  | "reset"
  | "depositor"
  | "checker"
  | "config-creator";

class Cli {
  configPath = "config";

  getConfigChoices() {
    try {
      const fileNames = fs.readdirSync(this.configPath);

      const choices = fileNames
        .filter((filename) => !filename.endsWith(".example.json5"))
        .map((filename) => ({
          title: filename,
          value: `${this.configPath}/${path.basename(filename)}`,
        }));

      if (!choices.length) throw new Error(`add at least 1 valid config`);

      return choices;
    } catch (error) {
      logger.debug(error);
      logger.error((error as Error).message);
      process.exit();
    }
  }

  async run() {
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
        type: (prev) => (prev === "config-creator" ? null : "autocomplete"),
        name: "config",
        message: "pick a config file",
        choices: this.getConfigChoices(),
      },
    ]);

    return { mode: response.mode as Mode, config: response.config };
  }
}

export default Cli;
