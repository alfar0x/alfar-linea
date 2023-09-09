import axios from "axios";
import getMyIp from "../utils/getMyIp";
import waitInternetConnection from "../utils/waitInternetConnection";
import rawTokens from "../chain/linea/rawTokens";
import Big from "big.js";
import logger from "../utils/logger";

type TokenId = string;

type TokenPricesData = Record<TokenId, number>;

type GeskoResponse = Record<TokenId, { usd: number }>;

class Prices {
  url = "https://api.coingecko.com/api/v3/simple/price";
  updatePricesIntervalMinutes = 10;

  lastUpdateTimestamp: number;
  geskoIds: string[];
  prices: TokenPricesData;

  constructor(params: { geskoIds: string[] }) {
    const { geskoIds } = params;

    this.lastUpdateTimestamp = this.getOutdatedTimestamp() - 1;
    this.geskoIds = geskoIds;
    this.prices = {};
  }

  private getOutdatedTimestamp() {
    return Date.now() - this.updatePricesIntervalMinutes * 60 * 1000;
  }

  private async getGeskoPrices(
    isConnectionChecked = false
  ): Promise<GeskoResponse> {
    try {
      const params = { ids: this.geskoIds.join(","), vs_currencies: "usd" };

      const urlParams = new URLSearchParams(params).toString();

      const result = await axios.get(this.url + "?" + urlParams);

      return result.data as GeskoResponse;
    } catch (error) {
      const { message } = error as Error;

      if (isConnectionChecked) throw new Error(message);

      const myIp = await getMyIp();

      if (myIp) throw new Error(message);

      await waitInternetConnection();

      return await this.getGeskoPrices(true);
    }
  }

  private async updatePrices() {
    const geskoPrices = await this.getGeskoPrices();
    const prices = Object.keys(geskoPrices)
      .map((key) => ({ key, value: geskoPrices[key].usd }))
      .reduce(
        (acc, item) => ({ ...acc, [item.key]: item.value }),
        {} as TokenPricesData
      );

    this.prices = prices;

    logger.debug(`updating prices`);

    this.lastUpdateTimestamp = Date.now();
  }

  private isPricesOutdated() {
    const isOutdated = Big(this.lastUpdateTimestamp).lte(
      this.getOutdatedTimestamp()
    );
    return isOutdated;
  }

  async getTokenPrice(geskoId: string) {
    if (this.isPricesOutdated()) await this.updatePrices();

    const tokenPrice = this.prices[geskoId];

    if (!tokenPrice) throw new Error(`price of ${geskoId} is not defined`);

    return tokenPrice;
  }
}

const allChainsGeskoIds = [...rawTokens]
  .map((t) => t.geskoId)
  .filter((value, index, array) => array.indexOf(value) === index);

const prices = new Prices({ geskoIds: allChainsGeskoIds });

export default prices;
