import CHAIN_NAMES from "../constants/chainNames";
import Chain from "./chain";

type ChainName = (typeof CHAIN_NAMES)[number];
type ChainConfigs<T extends object> = Partial<Record<ChainName, T>>;

class ActionConfig<T extends object> {
  protected readonly chainConfigs: ChainConfigs<T>;

  public constructor(params: { chainConfigs: ChainConfigs<T> }) {
    const { chainConfigs } = params;

    this.chainConfigs = chainConfigs;
  }
  public getChainConfig(chain: Chain) {
    const config = this.chainConfigs[chain.name];

    if (!config) throw new Error(`action is not allowed in ${chain}`);

    return config;
  }
}

export type ChainConfig<U extends ActionConfig<object>> = ReturnType<
  U["getChainConfig"]
>;

export default ActionConfig;
