/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type BN from "bn.js";
import type { ContractOptions } from "web3-eth-contract";
import type { EventLog } from "web3-core";
import type { EventEmitter } from "events";
import type {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

export interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export interface SyncswapRouter extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): SyncswapRouter;
  clone(): SyncswapRouter;
  methods: {
    addLiquidity(
      pool: string,
      inputs: [string, number | string | BN][],
      data: string | number[],
      minLiquidity: number | string | BN,
      callback: string,
      callbackData: string | number[]
    ): PayableTransactionObject<string>;

    addLiquidity2(
      pool: string,
      inputs: [string, number | string | BN][],
      data: string | number[],
      minLiquidity: number | string | BN,
      callback: string,
      callbackData: string | number[]
    ): PayableTransactionObject<string>;

    addLiquidityWithPermit(
      pool: string,
      inputs: [string, number | string | BN][],
      data: string | number[],
      minLiquidity: number | string | BN,
      callback: string,
      callbackData: string | number[],
      permits: [
        string,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        string | number[],
        string | number[]
      ][]
    ): PayableTransactionObject<string>;

    addLiquidityWithPermit2(
      pool: string,
      inputs: [string, number | string | BN][],
      data: string | number[],
      minLiquidity: number | string | BN,
      callback: string,
      callbackData: string | number[],
      permits: [
        string,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        string | number[],
        string | number[]
      ][]
    ): PayableTransactionObject<string>;

    burnLiquidity(
      pool: string,
      liquidity: number | string | BN,
      data: string | number[],
      minAmounts: (number | string | BN)[],
      callback: string,
      callbackData: string | number[]
    ): NonPayableTransactionObject<[string, string][]>;

    burnLiquiditySingle(
      pool: string,
      liquidity: number | string | BN,
      data: string | number[],
      minAmount: number | string | BN,
      callback: string,
      callbackData: string | number[]
    ): NonPayableTransactionObject<[string, string]>;

    burnLiquiditySingleWithPermit(
      pool: string,
      liquidity: number | string | BN,
      data: string | number[],
      minAmount: number | string | BN,
      callback: string,
      callbackData: string | number[],
      permit: [number | string | BN, number | string | BN, string | number[]]
    ): NonPayableTransactionObject<[string, string]>;

    burnLiquidityWithPermit(
      pool: string,
      liquidity: number | string | BN,
      data: string | number[],
      minAmounts: (number | string | BN)[],
      callback: string,
      callbackData: string | number[],
      permit: [number | string | BN, number | string | BN, string | number[]]
    ): NonPayableTransactionObject<[string, string][]>;

    createPool(
      _factory: string,
      data: string | number[]
    ): PayableTransactionObject<string>;

    enteredPools(
      arg0: string,
      arg1: number | string | BN
    ): NonPayableTransactionObject<string>;

    enteredPoolsLength(account: string): NonPayableTransactionObject<string>;

    isPoolEntered(
      arg0: string,
      arg1: string
    ): NonPayableTransactionObject<boolean>;

    multicall(data: (string | number[])[]): PayableTransactionObject<string[]>;

    selfPermit(
      token: string,
      value: number | string | BN,
      deadline: number | string | BN,
      v: number | string | BN,
      r: string | number[],
      s: string | number[]
    ): PayableTransactionObject<void>;

    selfPermit2(
      token: string,
      value: number | string | BN,
      deadline: number | string | BN,
      signature: string | number[]
    ): PayableTransactionObject<void>;

    selfPermit2IfNecessary(
      token: string,
      value: number | string | BN,
      deadline: number | string | BN,
      signature: string | number[]
    ): PayableTransactionObject<void>;

    selfPermitAllowed(
      token: string,
      nonce: number | string | BN,
      expiry: number | string | BN,
      v: number | string | BN,
      r: string | number[],
      s: string | number[]
    ): PayableTransactionObject<void>;

    selfPermitAllowedIfNecessary(
      token: string,
      nonce: number | string | BN,
      expiry: number | string | BN,
      v: number | string | BN,
      r: string | number[],
      s: string | number[]
    ): PayableTransactionObject<void>;

    selfPermitIfNecessary(
      token: string,
      value: number | string | BN,
      deadline: number | string | BN,
      v: number | string | BN,
      r: string | number[],
      s: string | number[]
    ): PayableTransactionObject<void>;

    stake(
      stakingPool: string,
      token: string,
      amount: number | string | BN,
      onBehalf: string
    ): NonPayableTransactionObject<void>;

    swap(
      paths: [
        [string, string | number[], string, string | number[]][],
        string,
        number | string | BN
      ][],
      amountOutMin: number | string | BN,
      deadline: number | string | BN
    ): PayableTransactionObject<[string, string]>;

    swapWithPermit(
      paths: [
        [string, string | number[], string, string | number[]][],
        string,
        number | string | BN
      ][],
      amountOutMin: number | string | BN,
      deadline: number | string | BN,
      permit: [
        string,
        number | string | BN,
        number | string | BN,
        number | string | BN,
        string | number[],
        string | number[]
      ]
    ): PayableTransactionObject<[string, string]>;

    vault(): NonPayableTransactionObject<string>;

    wETH(): NonPayableTransactionObject<string>;
  };
  events: {
    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };
}
