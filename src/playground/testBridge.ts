import Account from "../core/account";
import { BridgeAction } from "../core/action/bridge";
import Chain from "../core/chain";
import randomFloat from "../utils/random/randomFloat";

const testBridge = async (params: {
  account: Account;
  action: BridgeAction;
  fromChain: Chain;
  toChain: Chain;
}) => {
  const { account, action, fromChain, toChain } = params;
  const nativeNormalizedAmount = fromChain.w3.utils.toWei(
    randomFloat(0.0001, 0.0002, 9),
    "ether"
  );

  return await action.bridge({
    account,
    fromToken: fromChain.getNative(),
    toToken: toChain.getNative(),
    normalizedAmount: nativeNormalizedAmount,
  });
};

export default testBridge;
