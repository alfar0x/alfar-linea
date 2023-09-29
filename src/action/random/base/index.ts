import Account from "../../../core/account";
import Action, { ActionProvider } from "../../../core/action";
import ActionContext from "../../../core/actionContext";
import Chain from "../../../core/chain";
import Step from "../../../core/step";

abstract class RandomAction extends Action {
  protected chain: Chain;

  protected constructor(params: {
    chain: Chain;
    provider: ActionProvider;
    operation: string;
    context: ActionContext;
  }) {
    const { chain, ...superParams } = params;

    super({ ...superParams, actionType: "RANDOM" });

    this.chain = chain;
  }

  // eslint-disable-next-line no-unused-vars
  public abstract steps(params: { account: Account }): Promise<Step[]> | Step[];
}

export default RandomAction;
