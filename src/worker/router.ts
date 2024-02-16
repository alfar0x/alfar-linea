import Big from "big.js";
import logger from "../utils/other/logger";

const ROUTE_SWAP_NATIVE_TOKEN_NATIVE = "SWAP_NATIVE_TOKEN_NATIVE";
const ROUTE_SWAP_TOKEN_NATIVE = "SWAP_TOKEN_NATIVE";
const ROUTE_LEND_REDEEM_NATIVE = "LEND_REDEEM_NATIVE";
const ROUTE_LEND_REDEEM_TOKEN = "LEND_REDEEM_TOKEN";
const ROUTE_RANDOM = "RANDOM";
const ROUTE_MINT_NFT = "MINT_NFT";

class Router {
  factory: any;

  public constructor() {
    this.factory = new ActionFactory();
  }

  public getActionIds() {}

  private async filterByBalances() {
    const { account, chains } = params;

    const available;

    for (const chain of chains) {
      const chainConfig = this.chainConfigs[chain.name];

      if (!chainConfig) {
        throw new Error(
          `unexpected error. router chain config is not defined for ${chain.name}`,
        );
      }

      const native = chain.getNative();
      const nativeReadableBalance = await native.readableBalanceOf(
        account.address,
      );

      const isNormalChain = Big(nativeReadableBalance).gte(
        chainConfig.minRescueNativeBalance,
      );

      if (isNormalChain) {
        normalChains.push(chain);
        continue;
      }

      const isRescueChain = Big(nativeReadableBalance).gte(
        chainConfig.minWorkNativeBalance,
      );

      if (isRescueChain) {
        rescueChains.push(chain);
        continue;
      }
    }

    return { rescueChains, normalChains };
  }

  public async getRoute() {
    const ids = this.getActionIds(); // returns filtered (comments) ids from file
    const actions = this.factory.getActions(); // returns all actions

    const activeActions = [];
    const invalidActionIds = [];

    for (const id of ids) {
      const action = actions.find((a) => a.id === id);
      if (!action) invalidActionIds.push(id);
      else activeActions.push(action);
    }

    if (invalidActionIds.length) {
      logger.error(
        `invalid action ids detected: ${invalidActionIds.join(", ")}`,
      );
    }

    const chains = activeActions.map((a) => a.chain.name).filter(uniqueHelper);
  }
}
