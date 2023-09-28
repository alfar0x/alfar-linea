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
    const { chain, provider, operation, context } = params;

    super({ provider, actionType: "RANDOM", operation: operation, context });

    this.chain = chain;
  }

  // eslint-disable-next-line no-unused-vars
  public abstract steps(params: { account: Account }): Promise<Step[]> | Step[];

  protected getContractAddress(params: {
    contractName: string;
    chain?: Chain;
  }) {
    const { chain = this.chain, contractName } = params;

    const contractAddress = chain.getContractAddressByName(contractName);

    if (!contractAddress) {
      throw new Error(`action is not available in ${chain}`);
    }

    return contractAddress;
  }
}

export default RandomAction;
