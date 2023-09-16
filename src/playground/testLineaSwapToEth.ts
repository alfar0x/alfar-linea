import Linea from "../chain/linea";
import Account from "../core/account";
import { SwapAction } from "../core/action/swap";
import sleep from "../utils/other/sleep";

const testLineaSwapToEth = async (params: {
  account: Account;
  action: SwapAction;
  tokenName: string;
  isApprove?: boolean;
}) => {
  const { account, action, tokenName, isApprove } = params;
  const linea = new Linea({ rpc: "https://1rpc.io/linea" });

  const fromToken = linea.getTokenByName(tokenName);
  const toToken = linea.getNative();

  const normalizedAmount = await fromToken.normalizedBalanceOf(account.address);

  if (isApprove) {
    const address = action.getApproveAddress(linea);
    if (!address) return;
    await fromToken.approve(account, address, normalizedAmount);
    await sleep(10);
  }

  return await action.swap({ account, fromToken, toToken, normalizedAmount });
};

export default testLineaSwapToEth;
