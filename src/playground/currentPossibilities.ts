import Linea from "../chain/linea";
import ACTION_PROVIDERS from "../constants/actionProviders";
import { Provider } from "../core/action";
import initializeFactory from "../worker/tasksRunner/initializeFactory";

const currentPossibilities = () => {
  const factory = initializeFactory({
    chain: new Linea({ rpc: "https://linea.drpc.org" }),
    activeProviders: ACTION_PROVIDERS as unknown as Provider[],
    minWorkAmountPercent: 1,
    maxWorkAmountPercent: 5,
  });

  // eslint-disable-next-line no-console
  console.info(factory.infoString(true));
};

export default currentPossibilities;
