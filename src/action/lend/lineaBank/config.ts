import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import { DEFAULT_SLIPPAGE_PERCENT } from "../../../constants";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    Linea: {
      marketAddresses: {
        ETH: formatToChecksum("0xc7D8489DaE3D2EbEF075b1dB2257E2c231C9D231"),
        USDC: formatToChecksum("0x2aD69A0Cf272B9941c7dDcaDa7B0273E9046C4B0"),
        WBTC: formatToChecksum("0xEa0F73296a6147FB56bAE29306Aae0FFAfF9De5F"),
      },
      coreAddress: formatToChecksum(
        "0x009a0b7c38b542208936f1179151cd08e2943833",
      ),
      distributorAddress: formatToChecksum(
        "0x5d06067f86946620c326713b846ddc8b97470957",
      ),
      coreContract: getWeb3Contract("LineaBankCore"),
      distributorContract: getWeb3Contract("LineaBankLabDistributor"),
      slippagePercent: DEFAULT_SLIPPAGE_PERCENT,
    },
  },
});

export default config;
