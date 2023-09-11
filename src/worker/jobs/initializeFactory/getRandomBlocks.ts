import RandomBlock from "../../../block/random/base";
import DmailSendMail from "../../../block/random/dmail";
import { Provider } from "../../../core/action/types";
import Chain from "../../../core/chain";

const getImplementedProviders = (params: {
  chain: Chain;
}): Partial<Record<Provider, RandomBlock>> => {
  const { chain } = params;
  return {
    DMAIL: new DmailSendMail({ chain }),
  };
};

const getRandomBlocks = (params: {
  activeProviders: Provider[];
  chain: Chain;
}) => {
  const { activeProviders, chain } = params;

  const implementedProviders = getImplementedProviders({ chain });

  const blocks = activeProviders
    .map((provider) => {
      const block = implementedProviders[provider];

      return block;
    })
    .filter(Boolean);

  return blocks as RandomBlock[];
};

export default getRandomBlocks;
