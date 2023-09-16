/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface SyncswapClassicPoolFactoryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "createPool"
      | "getDeployData"
      | "getPool"
      | "getSwapFee"
      | "master"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "PoolCreated"): EventFragment;

  encodeFunctionData(
    functionFragment: "createPool",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getDeployData",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPool",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getSwapFee",
    values: [AddressLike, AddressLike, AddressLike, AddressLike, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "master", values?: undefined): string;

  decodeFunctionResult(functionFragment: "createPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDeployData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getSwapFee", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "master", data: BytesLike): Result;
}

export namespace PoolCreatedEvent {
  export type InputTuple = [
    token0: AddressLike,
    token1: AddressLike,
    pool: AddressLike
  ];
  export type OutputTuple = [token0: string, token1: string, pool: string];
  export interface OutputObject {
    token0: string;
    token1: string;
    pool: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface SyncswapClassicPoolFactory extends BaseContract {
  connect(runner?: ContractRunner | null): SyncswapClassicPoolFactory;
  waitForDeployment(): Promise<this>;

  interface: SyncswapClassicPoolFactoryInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  createPool: TypedContractMethod<[data: BytesLike], [string], "nonpayable">;

  getDeployData: TypedContractMethod<[], [string], "view">;

  getPool: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [string],
    "view"
  >;

  getSwapFee: TypedContractMethod<
    [
      pool: AddressLike,
      sender: AddressLike,
      tokenIn: AddressLike,
      tokenOut: AddressLike,
      data: BytesLike
    ],
    [bigint],
    "view"
  >;

  master: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "createPool"
  ): TypedContractMethod<[data: BytesLike], [string], "nonpayable">;
  getFunction(
    nameOrSignature: "getDeployData"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getPool"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "getSwapFee"
  ): TypedContractMethod<
    [
      pool: AddressLike,
      sender: AddressLike,
      tokenIn: AddressLike,
      tokenOut: AddressLike,
      data: BytesLike
    ],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "master"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "PoolCreated"
  ): TypedContractEvent<
    PoolCreatedEvent.InputTuple,
    PoolCreatedEvent.OutputTuple,
    PoolCreatedEvent.OutputObject
  >;

  filters: {
    "PoolCreated(address,address,address)": TypedContractEvent<
      PoolCreatedEvent.InputTuple,
      PoolCreatedEvent.OutputTuple,
      PoolCreatedEvent.OutputObject
    >;
    PoolCreated: TypedContractEvent<
      PoolCreatedEvent.InputTuple,
      PoolCreatedEvent.OutputTuple,
      PoolCreatedEvent.OutputObject
    >;
  };
}
