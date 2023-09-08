import fs from "fs";
import path from "path";
import logger from "../common/logger";
import prompts from "prompts";
import greetingsStr from "../utils/greetingsStr";
import sleep from "../common/sleep";

const modeChoices = [
  {
    title: "block",
    value: "block",
    description: "run random linea blocks",
  },
  {
    title: "eth returner",
    value: "reset",
    description: "return all tokens/pools to eth",
    disabled: true,
  },
  {
    title: "deposit",
    value: "deposit",
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

type Mode = "block" | "reset" | "deposit" | "checker" | "config-creator";

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
