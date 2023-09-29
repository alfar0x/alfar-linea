import fs from "fs";
import path from "path";

import prompts from "prompts";

import greetingsStr from "../other/greetingsStr";
import sleep from "../other/sleep";

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
];

type Mode = "checker" | "encrypter" | "task-runner";

const configPath = "config";

const getConfigChoices = () => {
  const fileNames = fs.readdirSync(configPath);

  const choices = fileNames
    .filter((filename) => !filename.endsWith(".example.json5"))
    .map((filename) => ({
      title: filename,
      value: `${configPath}/${path.basename(filename)}`,
    }));

  if (!choices.length) {
    throw new Error(
      `add at least 1 valid config (examples is not valid). Check config folder`,
    );
  }

  return choices;
};

const startMenu = async () => {
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
      choices: getConfigChoices(),
    },
  ]);

  return { mode: response.mode as Mode, config: response.config };
};

export default startMenu;
