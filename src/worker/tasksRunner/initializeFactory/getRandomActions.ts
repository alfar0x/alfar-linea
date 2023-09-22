import RandomAction from "../../../action/random/base";
import DmailSendMailAction from "../../../action/random/dmailSendMail";
import { Provider } from "../../../core/action";
import Chain from "../../../core/chain";

const getProviderActions = (
  provider: Provider,
  chain: Chain,
): RandomAction[] => {
  switch (provider) {
    case "DMAIL": {
      return [new DmailSendMailAction({ chain })];
    }
    default: {
      return [];
    }
  }
};

const getRandomActions = (activeProviders: Provider[], chain: Chain) =>
  activeProviders.flatMap((provider) => getProviderActions(provider, chain));

export default getRandomActions;
