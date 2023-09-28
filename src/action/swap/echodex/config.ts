import getEthersInterface from "../../../abi/methods/getEthersInterface";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    Linea: {
      routerAddress: formatToChecksum(
        "0xF82537FB6c56A3b50092d3951f84F5F6c835b4F5",
      ),
      routerInterface: getEthersInterface("EchoDexSmartRouter"),
      unwrapEthAddress: "0x0000000000000000000000000000000000000002",
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
    },
  },
});

export default config;
