import RandomAction from "../../../action/random/base";
import DmailSendMailAction from "../../../action/random/dmailSendMail";
import { ActionProvider } from "../../../core/action";
import ActionContext from "../../../core/actionContext";
import Chain from "../../../core/chain";

const getProviderActions = (
  provider: ActionProvider,
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
  activeProviders: ActionProvider[],
  chain: Chain,
  context: ActionContext,
) =>
  activeProviders.flatMap((provider) =>
    getProviderActions(provider, chain, context),
  );

export default getRandomActions;
