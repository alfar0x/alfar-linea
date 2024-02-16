import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const API_URL = "https://aggregator-api.xy.finance/v1/";

const config = new ActionConfig({
  chainConfigs: {
    linea: {
      routerAddress: formatToChecksum(
        "0xc693C8AAD9745588e95995fef4570d6DcEF98000",
      ),
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
      apiUrl: API_URL,
      resendTxTimes: 5,
    },
  },
});

export default config;
