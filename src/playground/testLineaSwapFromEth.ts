import { SwapAction } from "../action/swap/base";
import Linea from "../chain/linea";
import Account from "../core/account";
import randomFloat from "../utils/random/randomFloat";

const testLineaSwapFromEth = async (params: {
  account: Account;
  action: SwapAction;
  tokenName: string;
}) => {
  const { account, action, tokenName } = params;

  const linea = new Linea({ rpc: "https://1rpc.io/linea" });

  const fromToken = linea.getNative();
  const toToken = linea.getTokenByName(tokenName);

  const normalizedAmount = linea.w3.utils.toWei(
    randomFloat(0.0001, 0.0002, 9),
    "ether",
  );

  return await action.swap({ account, fromToken, toToken, normalizedAmount });
};

export default testLineaSwapFromEth;
