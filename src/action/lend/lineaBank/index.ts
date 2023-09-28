import Big from "big.js";
import { Transaction } from "web3";

import {
  CONTRACT_LINEA_BANK_CORE,
  CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
} from "../../../abi/constants/contracts";
import getWeb3Contract from "../../../abi/methods/getWeb3Contract";
import Account from "../../../core/account";
import Chain from "../../../core/chain";
import Token from "../../../core/token";
import { Amount } from "../../../types";
import LendAction from "../base";

import ActionContext from "../../../core/actionContext";
import { CHAINS_DATA } from "./constants";

class LineaBankLend extends LendAction {
  private readonly coreContractAddress: string;
  private readonly distributorContractAddress: string;
  private readonly marketAddress: string;

  public constructor(params: { token: Token; context: ActionContext }) {
    const { token, context } = params;
    super({ token, provider: "LINEA_BANK", context });

    this.coreContractAddress = this.getContractAddress({
      contractName: CONTRACT_LINEA_BANK_CORE,
    });
    this.distributorContractAddress = this.getContractAddress({
      contractName: CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
    });
    this.marketAddress = this.getMarketAddress();
  }

  private getMarketAddress() {
    const marketAddress =
      CHAINS_DATA[this.token.chain.chainId]?.[this.token.name]?.marketAddress;

    if (!marketAddress) {
      throw new Error(`market address is not defined`);
    }

    return marketAddress;
  }

  private async getAccountDistribution(params: {
    account: Account;
    chain: Chain;
  }) {
    const { account, chain } = params;
    const { w3 } = chain;

    const distributorContract = getWeb3Contract({
      w3,
      name: CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
      address: this.distributorContractAddress,
    });

    const accountDistribution = await distributorContract.methods
      .accountDistributionInfoOf(this.marketAddress, account.address)
      .call();

    const normalizedSupply = accountDistribution[1];

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
    const { chain } = this.token;
    const { w3 } = chain;

    await this.checkIsBalanceAllowed({ account, normalizedAmount });

    const coreContract = getWeb3Contract({
      w3,
      name: CONTRACT_LINEA_BANK_CORE,
      address: this.coreContractAddress,
    });

    const supplyCall = coreContract.methods.supply(
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
      to: this.coreContractAddress,
      value,
    };

    const resultMsg = await this.getDefaultSupplyResultMsg({
      normalizedAmount,
    });

    return { tx, resultMsg };
  }

  protected async redeemAll(params: { account: Account }) {
    const { account } = params;
    const { chain } = this.token;
    const { w3 } = chain;

    const normalizedSupply = await this.getAccountDistribution({
      account,
      chain,
    });

    if (Big(normalizedSupply).lte(0)) {
      throw new Error(`supplied amount is lte that zero: ${normalizedSupply}`);
    }

    const coreContract = getWeb3Contract({
      w3,
      name: CONTRACT_LINEA_BANK_CORE,
      address: this.coreContractAddress,
    });

    const redeemTokenCall = coreContract.methods.redeemToken(
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
      to: this.coreContractAddress,
    };

    const resultMsg = await this.getDefaultRedeemResultMsg({});

    return { tx, resultMsg };
  }
}

export default LineaBankLend;
