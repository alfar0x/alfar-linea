/* eslint-disable no-unused-vars */
import Account from "../../core/account";
import Chain from "../../core/chain";
import Step from "../../core/step";
import RunnableTransaction from "../../core/transaction";

abstract class RandomStep extends Step {
  protected chain: Chain;

  constructor(params: { name: string; chain: Chain }) {
    const { name, chain } = params;

    super({ name });

    this.chain = chain;
  }

  abstract allTransactions(account: Account): RunnableTransaction[];
}

export default RandomStep;
