import Big from "big.js";

import {
  CONTRACT_LINEA_BANK_CORE,
  CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
} from "../../../constants/contracts";
import Account from "../../../core/account";
import { SupplyAction } from "../../../core/action/supply";
import Chain from "../../../core/chain";
import Token from "../../../core/token";
import getContract from "../../../utils/web3/getContract";

import { CHAINS_DATA } from "./constants";

class LineaBankSupply extends SupplyAction {
  constructor() {
    super({
      provider: "LINEA_BANK",
    });
  }

  public getApproveAddress(chain: Chain, token: Token) {
    const chainData = CHAINS_DATA[chain.chainId] || {};
    const { marketAddress } = chainData[token.name] || {};

    if (!marketAddress) {
      throw new Error(`Market address is not defined for ${token}`);
    }

    return marketAddress;
  }

  private getCoreAddress(chain: Chain) {
    const coreContractAddress = chain.getContractAddressByName(
      CONTRACT_LINEA_BANK_CORE
    );

    if (!coreContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    return coreContractAddress;
  }

  private getDistributorAddress(chain: Chain) {
    const distributorContractAddress = chain.getContractAddressByName(
      CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR
    );

    if (!distributorContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    return distributorContractAddress;
  }

  private getMarketAddress(token: Token) {
    const chainData = CHAINS_DATA[token.chain.chainId] || {};
    const { marketAddress } = chainData[token.name] || {};

    if (!marketAddress) {
      throw new Error(`Market address is not defined for ${token}`);
    }

    return marketAddress;
  }

  async getAccountDistribution(params: {
    account: Account;
    chain: Chain;
    marketAddress: string;
  }) {
    const { account, chain, marketAddress } = params;
    const { w3 } = chain;

    const distributorContractAddress = this.getDistributorAddress(chain);

    const distributorContract = getContract({
      w3,
      name: CONTRACT_LINEA_BANK_LAB_DISTRIBUTOR,
      address: distributorContractAddress,
    });

    const accountDistribution = await distributorContract.methods
      .accountDistributionInfoOf(marketAddress, account.address)
      .call();

    const normalizedSupply = accountDistribution[1];

    return normalizedSupply;
  }

  private async checkIsSupplyAllowed(params: {
    account: Account;
    token: Token;
    normalizedAmount: number | string;
  }) {
    const { account, token, normalizedAmount } = params;

    const { chain } = token;

    const coreContractAddress = this.getCoreAddress(chain);

    const distributorContractAddress = this.getDistributorAddress(chain);

    if (!coreContractAddress || !distributorContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const marketAddress = this.getMarketAddress(token);

    if (!token.isNative) {
      const normalizedAllowance = await token.normalizedAllowance(
        account,
        marketAddress
      );

      if (Big(normalizedAllowance).lt(normalizedAmount)) {
        const readableAllowance = await token.toReadableAmount(
          normalizedAllowance
        );
        const readableAmount = await token.toReadableAmount(normalizedAmount);

        throw new Error(
          `account ${token} allowance is less than amount: ${readableAllowance} < ${readableAmount}`
        );
      }
    }

    const normalizedBalance = await token.normalizedBalanceOf(account.address);

    if (Big(normalizedBalance).lt(normalizedAmount)) {
      const readableBalance = await token.toReadableAmount(normalizedBalance);
      const readableAmount = await token.toReadableAmount(normalizedAmount);

      throw new Error(
        `account ${token} balance is less than amount: ${readableBalance} < ${readableAmount}`
      );
    }

    return { marketAddress, coreContractAddress };
  }

  private async checkIsRedeemAllowed(params: {
    account: Account;
    token: Token;
  }) {
    const { account, token } = params;

    const { chain } = token;

    const coreContractAddress = chain.getContractAddressByName(
      CONTRACT_LINEA_BANK_CORE
    );

    const distributorContractAddress = this.getDistributorAddress(chain);

    if (!coreContractAddress || !distributorContractAddress) {
      throw new Error(`${this.name} action is not available in ${chain.name}`);
    }

    const marketAddress = this.getMarketAddress(token);

    const normalizedSupply = await this.getAccountDistribution({
      account,
      chain,
      marketAddress,
    });

    return {
      marketAddress,
      coreContractAddress,
      normalizedSupply,
    };
  }

  async supply(params: {
    account: Account;
    token: Token;
    normalizedAmount: number | string;
  }) {
    const { account, token, normalizedAmount } = params;
    const { chain } = token;
    const { w3 } = chain;

    const { marketAddress, coreContractAddress } =
      await this.checkIsSupplyAllowed({
        account,
        token,
        normalizedAmount,
      });

    const coreContract = getContract({
      w3,
      name: CONTRACT_LINEA_BANK_CORE,
      address: coreContractAddress,
    });

    const supplyCall = coreContract.methods.supply(
      marketAddress,
      normalizedAmount
    );

    const value = token.isNative ? normalizedAmount : 0;

    const estimatedGas = await supplyCall.estimateGas({
      from: account.address,
      value,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data: supplyCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: coreContractAddress,
      value,
    };

    const hash = await account.signAndSendTransaction(chain, tx);

    const inReadableAmount = await token.toReadableAmount(normalizedAmount);

    return { hash, inReadableAmount };
  }

  async redeemAll(params: { account: Account; token: Token }) {
    const { account, token } = params;
    const { chain } = token;
    const { w3 } = chain;

    const { marketAddress, coreContractAddress, normalizedSupply } =
      await this.checkIsRedeemAllowed({
        account,
        token,
      });

    const coreContract = getContract({
      w3,
      name: CONTRACT_LINEA_BANK_CORE,
      address: coreContractAddress,
    });

    const redeemTokenCall = coreContract.methods.redeemToken(
      marketAddress,
      normalizedSupply
    );

    const estimatedGas = await redeemTokenCall.estimateGas({
      from: account.address,
    });

    const nonce = await account.nonce(w3);

    const gasPrice = await w3.eth.getGasPrice();

    const tx = {
      data: redeemTokenCall.encodeABI(),
      from: account.address,
      gas: estimatedGas,
      gasPrice,
      nonce,
      to: coreContractAddress,
    };

    const hash = await account.signAndSendTransaction(chain, tx);

    const outReadableAmount = await token.toReadableAmount(normalizedSupply);

    return { hash, outReadableAmount };
  }
}

export default LineaBankSupply;
