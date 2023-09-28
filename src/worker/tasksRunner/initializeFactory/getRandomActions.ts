import RandomAction from "../../../action/random/base";
import DmailSendMailAction from "../../../action/random/dmailSendMail";
import { Provider } from "../../../core/action";
import ActionContext from "../../../core/actionContext";
import Chain from "../../../core/chain";

const getProviderActions = (
  provider: Provider,
  chain: Chain,
  context: ActionContext,
): RandomAction[] => {
  switch (provider) {
    case "DMAIL": {
      return [new DmailSendMailAction({ chain, context })];
    }
    default: {
      return [];
    }
  }
};

const getRandomActions = (
  activeProviders: Provider[],
  chain: Chain,
  context: ActionContext,
) =>
  activeProviders.flatMap((provider) =>
    getProviderActions(provider, chain, context),
  );

export default getRandomActions;
