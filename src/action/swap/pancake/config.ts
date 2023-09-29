import getEthersInterface from "../../../abi/methods/getEthersInterface";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    Linea: {
      fee: 100,
      sqrtPriceLimitX96: 0,
      unwrapEthAddress: "0x0000000000000000000000000000000000000002",
      initialGasMultiplier: 1.6,
      resendTxTimes: 5,
      minOutSlippagePercent: 2,
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
      routerAddress: formatToChecksum(
        "0x678Aa4bF4E210cf2166753e054d5b7c31cc7fa86",
      ),
      factoryAddress: formatToChecksum(
        "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
      ),
      quoteAddress: formatToChecksum(
        "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
      ),
      factoryInterface: getEthersInterface("PancakeFactory"),
      quoteInterface: getEthersInterface("PancakeQuote"),
      routerInterface: getEthersInterface("PancakeSwapRouter"),
    },
  },
});

export default config;
