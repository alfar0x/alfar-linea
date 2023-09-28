import Account from "../../../core/account";
import Action, { Provider } from "../../../core/action";
import Chain from "../../../core/chain";
import Step from "../../../core/step";

abstract class RandomAction extends Action {
  protected chain: Chain;

  protected constructor(params: {
    chain: Chain;
    provider: Provider;
    operation: string;
  }) {
    const { chain, provider, operation } = params;

    super({ provider, actionType: "RANDOM", operation: operation });

    this.chain = chain;
  }

  // eslint-disable-next-line no-unused-vars
  public abstract steps(params: {
    account: Account;
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }): Promise<Step[]> | Step[];

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
