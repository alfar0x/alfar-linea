import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import ActionConfig from "../../../core/actionConfig";
import formatToChecksum from "../../../utils/formatters/formatToChecksum";

const config = new ActionConfig({
  chainConfigs: {
    linea: {
      dmailAddress: formatToChecksum(
        "0xd1a3abf42f9e66be86cfdea8c5c2c74f041c5e14",
      ),
      dmailContract: getWeb3Contract("Dmail"),
    },
  },
});

export default config;
