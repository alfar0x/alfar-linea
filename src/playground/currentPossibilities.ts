import Linea from "../chain/linea";
import ACTION_PROVIDERS from "../constants/actionProviders";
import { Provider } from "../core/action/types";
import initializeFactory from "../worker/jobsGenerator/initializeFactory";

const currentPossibilities = async () => {
  const factory = initializeFactory({
    chain: new Linea({ rpc: "https://linea.drpc.org" }),
    activeProviders: ACTION_PROVIDERS as unknown as Provider[],
    minWorkAmountPercent: 1,
    maxWorkAmountPercent: 5,
  });

  console.info(factory.infoString(true));
};

export default currentPossibilities;
