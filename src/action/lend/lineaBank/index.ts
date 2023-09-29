import Big from "big.js";
import { Transaction } from "web3";

import Account from "../../../core/account";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import LendAction from "../base";

import ActionContext from "../../../core/actionContext";
import { ChainConfig } from "../../../core/actionConfig";
import config from "./config";

class LineaBankLend extends LendAction {
  private readonly config: ChainConfig<typeof config>;
  private readonly marketAddress: string;

  public constructor(params: { token: Token; context: ActionContext }) {
    super({ ...params, provider: "LINEA_BANK" });

    this.config = config.getChainConfig(params.token.chain);
    this.marketAddress = this.getMarketAddress();
  }

  private getMarketAddress() {
    const { marketAddresses } = this.config;

    const marketAddress = marketAddresses[
      this.token.name as keyof typeof marketAddresses
    ] as string | undefined;

    if (!marketAddress) {
      throw new Error(`action is not allowed for ${this.token}`);
    }
    return marketAddress;
  }

  private async getAccountDistribution(params: { account: Account }) {
    const { account } = params;
    const { distributorAddress, distributorContract } = this.config;
    const { w3 } = this.token.chain;

    const distribution = await distributorContract(w3, distributorAddress)
      .methods.accountDistributionInfoOf(this.marketAddress, account.address)
      .call();

    const normalizedSupply = distribution[1];

    return normalizedSupply;
  }

  protected async approveSupply(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;

    return await LineaBankLend.getDefaultApproveTransaction({
      account,
      token: this.token,
      spenderAddress: this.marketAddress,
      normalizedAmount,
    });
  }

  protected async supply(params: {
    account: Account;
    normalizedAmount: Amount;
  }) {
    const { account, normalizedAmount } = params;
    const { coreContract, coreAddress } = this.config;

    const { w3 } = this.token.chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const supplyCall = coreContract(w3, coreAddress).methods.supply(
      this.marketAddress,
      normalizedAmount,
    );

    const value = this.token.isNative ? normalizedAmount : 0;

    const estimatedGas = await supplyCall.estimateGas({
      from: account.address,
      value,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx: Transaction = {
      data: supplyCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: coreAddress,
      value,
    };

    const resultMsg = await this.getDefaultSupplyResultMsg({
      normalizedAmount,
    });

    return { tx, resultMsg };
  }

  protected async redeemAll(params: { account: Account }) {
    const { account } = params;
    const { coreContract, coreAddress } = this.config;

    const { w3 } = this.token.chain;

    const normalizedSupply = await this.getAccountDistribution({ account });

    if (Big(normalizedSupply).lte(0)) {
      throw new Error(`supplied amount is lte that zero: ${normalizedSupply}`);
    }

    const redeemTokenCall = coreContract(w3, coreAddress).methods.redeemToken(
      this.marketAddress,
      normalizedSupply,
    );

    const estimatedGas = await redeemTokenCall.estimateGas({
      from: account.address,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx: Transaction = {
      data: redeemTokenCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: coreAddress,
    };

    const resultMsg = await this.getDefaultRedeemResultMsg({});

    return { tx, resultMsg };
  }
}

export default LineaBankLend;
