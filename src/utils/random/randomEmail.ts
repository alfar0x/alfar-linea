import { randomInt } from "crypto";

import randomChoice from "./randomChoice";
import randomSymbols from "./randomSymbols";

const generateEmail = () => {
  const domains = ["dmail.ai", "gmail.com"];

  const address = randomSymbols(randomInt(8, 15));
  const domain = randomChoice(domains);
  return `${address}@${domain}`;
};

export default generateEmail;
