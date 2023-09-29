import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    Linea: {
      withdrawalMode: {
        vaultInternalTransfer: 0,
        withdrawEth: 1,
        withdrawWeth: 2,
      },
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
      factoryAddress: formatToChecksum(
        "0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d",
      ),
      routerAddress: formatToChecksum(
        "0x80e38291e06339d10aab483c65695d004dbd5c69",
      ),
      factoryContract: getWeb3Contract("SyncswapClassicPoolFactory"),
      routerContract: getWeb3Contract("SyncswapRouter"),
    },
  },
});

export default config;
