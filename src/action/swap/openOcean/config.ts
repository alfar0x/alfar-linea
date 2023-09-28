import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const API_URL = "https://open-api.openocean.finance/v3";

const config = new ActionConfig({
  chainConfigs: {
    Linea: {
      apiUrl: `${API_URL}/linea`,
      routerAddress: formatToChecksum(
        "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
      ),
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
    },
  },
});

export default config;
