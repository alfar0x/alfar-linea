import Account from "../../core/account";
import Block from "../../core/block";
import Step from "../../core/step";

abstract class RandomBlock extends Block {
  // eslint-disable-next-line no-unused-vars
  abstract allSteps(account: Account): Step[];
  // eslint-disable-next-line no-unused-vars
  abstract resetSteps(account: Account): Step[];
}

export default RandomBlock;
