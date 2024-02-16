import fs from "fs";
import path from "path";

import prompts from "prompts";

import greetingsStr from "../other/greetingsStr";
import sleep from "../other/sleep";

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

  const configs = getConfigChoices();

  if (configs.length === 1) return { config: configs[0].value };

  const response = await prompts([
    {
      type: "autocomplete",
      name: "config",
      message: "pick a config file",
      choices: configs,
    },
  ]);

  return {
    config: response.config,
  };
};

export default startMenu;
