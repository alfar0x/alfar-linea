import axios from "axios";
import Big from "big.js";

import rawTokens from "../chain/linea/rawTokens";
import logger from "../utils/other/logger";
import waitInternetConnection from "../utils/other/waitInternetConnection";

type TokenId = string;

type TokenPricesData = Record<TokenId, number>;

type GeskoResponse = Record<TokenId, { usd: number }>;

class Prices {
  private readonly url = "https://api.coingecko.com/api/v3/simple/price";
  private readonly updatePricesIntervalMinutes = 10;

  private lastUpdateTimestamp: number;
  private readonly geskoIds: string[];
  private prices: TokenPricesData;

  private static _instance: Prices | null;

  public static get instance() {
    if (!Prices._instance) {
      const geskoIds = [...rawTokens]
        .map((t) => t.geskoId)
        .filter((value, index, array) => array.indexOf(value) === index);

      Prices._instance = new Prices({ geskoIds });
    }

    return Prices._instance;
  }

  private constructor(params: { geskoIds: string[] }) {
    const { geskoIds } = params;

    this.lastUpdateTimestamp = this.getOutdatedTimestamp() - 1;
    this.geskoIds = geskoIds;
    this.prices = {};
  }

  private getOutdatedTimestamp() {
    const updatePricesIntervalMillis =
      this.updatePricesIntervalMinutes * 60 * 1000;
    return Date.now() - updatePricesIntervalMillis;
  }

  @waitInternetConnection()
  private async getGeskoPrices(): Promise<GeskoResponse> {
    // eslint-disable-next-line camelcase
    const params = { ids: this.geskoIds.join(","), vs_currencies: "usd" };

    const urlParams = new URLSearchParams(params).toString();

    const result = await axios.get(`${this.url}?${urlParams}`);

    return result.data as GeskoResponse;
  }

  public async updatePrices() {
    logger.debug(`updating token prices`);

    const geskoPrices = await this.getGeskoPrices();

    const prices = Object.keys(geskoPrices)
      .map((key) => ({ key, value: geskoPrices[key].usd }))
      .reduce(
        (acc, item) => ({ ...acc, [item.key]: item.value }),
        {} as TokenPricesData,
      );

    this.prices = prices;

    this.lastUpdateTimestamp = Date.now();
  }

  private isPricesOutdated() {
    const isOutdated = Big(this.lastUpdateTimestamp).lte(
      this.getOutdatedTimestamp(),
    );
    return isOutdated;
  }

  public async getTokenPrice(geskoId: string) {
    if (this.isPricesOutdated()) await this.updatePrices();

    const tokenPrice = this.prices[geskoId];

    if (!tokenPrice) throw new Error(`price of ${geskoId} is not defined`);

    return tokenPrice;
  }
}

export default Prices;
