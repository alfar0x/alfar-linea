import Big from "big.js";
import cliProgress from "cli-progress";

import Linea from "../../chain/linea";
import Chain from "../../core/chain";
import sliceIntoChunks from "../../utils/array/sliceIntoChunks";
import sleep from "../../utils/other/sleep";

import CheckerConfig from "./config";
import initializeAddresses from "./initializeAddresses";

class Checker {
  private config: CheckerConfig;
  private chain: Chain;
  private addresses: string[];

  public constructor(configFileName: string) {
    this.config = new CheckerConfig({ configFileName });

    const { rpc } = this.config.fixed;

    this.chain = new Linea({ rpc: rpc.linea });
    this.addresses = [];
  }

  private async checkAccount(address: string) {
    const { hideBalanceLessThanUsd } = this.config.fixed;

    const nonce = await this.chain.w3.eth.getTransactionCount(address);

    const balances = await Promise.all(
      this.chain.tokens.map(async (token) => {
        const tokenBalance = await token.readableBalanceOf(address);
        const usdBalance = await token.readableAmountToUsd(tokenBalance);
        const symbol = await token.symbol();

        return { symbol, tokenBalance, usdBalance };
      }),
    );

    const balancesObj = balances.reduce(
      (acc, item) => {
        if (Big(item.usdBalance).lt(hideBalanceLessThanUsd)) return acc;

        return {
          ...acc,
          [item.symbol]: `${item.tokenBalance} ($${item.usdBalance})`,
        };
      },
      {} as Record<string, string>,
    );

    return {
      address,
      "txs (nonce)": nonce.toString(),
      ...balancesObj,
    };
  }

  private async checkAllAccounts() {
    const { delayBetweenChunkSec, maxParallelAccounts } = this.config.fixed;
    const chunks = sliceIntoChunks(this.addresses, maxParallelAccounts);

    const bar = new cliProgress.SingleBar({});

    bar.start(this.addresses.length, 0);

    const accountsData = [];

    while (chunks.length) {
      const chunk = chunks.shift();

      if (!chunk) return accountsData;

      const chunkResult = await Promise.all(
        chunk.map((addr) => this.checkAccount(addr)),
      );

      accountsData.push(...chunkResult);

      bar.increment(chunk.length);

      if (chunks.length) await sleep(delayBetweenChunkSec);
    }

    bar.stop();

    return accountsData;
  }

  public async run() {
    const { files } = this.config.fixed;

    this.addresses = await initializeAddresses({
      addressesFileName: files.addresses,
      privateKeysFileName: files.privateKeys,
    });

    const result = await this.checkAllAccounts();

    // eslint-disable-next-line no-console
    console.table(result);

    process.exit();
  }
}

export default Checker;
