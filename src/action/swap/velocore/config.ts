import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    linea: {
      tokenTypes: {
        erc20: 0,
        erc721: 1,
        erc1155: 2,
      },
      amountTypes: {
        exactly: 0,
        atMost: 1,
        all: 2,
      },
      operationTypes: { swap: 0 },
      packedEth:
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
      vaultAddress: formatToChecksum(
        "0x1d0188c4b276a09366d05d6be06af61a73bc7535",
      ),
      factoryAddress: formatToChecksum(
        "0xBe6c6A389b82306e88d74d1692B67285A9db9A47",
      ),
      vaultContract: getWeb3Contract("VelocoreVault"),
      factoryContract: getWeb3Contract("VelocoreFactory"),
    },
  },
});

export default config;
