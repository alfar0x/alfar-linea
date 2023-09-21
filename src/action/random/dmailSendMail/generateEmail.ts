import { randomInt } from "crypto";

import randomChoice from "../../../utils/random/randomChoice";
import randomSymbols from "../../../utils/random/randomSymbols";

const generateEmail = () => {
  const domains = ["dmail.ai", "gmail.com"];

  const address = randomSymbols(randomInt(8, 15));
  const domain = randomChoice(domains);
  return `${address}@${domain}`;
};

export default generateEmail;
