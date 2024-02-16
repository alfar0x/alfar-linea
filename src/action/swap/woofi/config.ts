import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    linea: {
      routerAddress: formatToChecksum(
        "0x39d361e66798155813b907a70d6c2e3fdafb0877",
      ),
      routerContract: getWeb3Contract("WoofiRouter"),
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
    },
  },
});

export default config;
