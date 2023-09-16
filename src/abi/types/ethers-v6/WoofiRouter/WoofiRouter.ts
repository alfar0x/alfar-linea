/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
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

export interface WoofiRouterInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "WETH"
      | "externalSwap"
      | "inCaseTokenGotStuck"
      | "isWhitelisted"
      | "owner"
      | "querySwap"
      | "quoteToken"
      | "renounceOwnership"
      | "setPool"
      | "setWhitelisted"
      | "swap"
      | "transferOwnership"
      | "tryQuerySwap"
      | "wooPool"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnershipTransferred"
      | "WooPoolChanged"
      | "WooRouterSwap"
  ): EventFragment;

  encodeFunctionData(functionFragment: "WETH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "externalSwap",
    values: [
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "inCaseTokenGotStuck",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isWhitelisted",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "querySwap",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setPool",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setWhitelisted",
    values: [AddressLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      AddressLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tryQuerySwap",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "wooPool", values?: undefined): string;

  decodeFunctionResult(functionFragment: "WETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "externalSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "inCaseTokenGotStuck",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWhitelisted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "querySwap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "quoteToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setWhitelisted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tryQuerySwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wooPool", data: BytesLike): Result;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WooPoolChangedEvent {
  export type InputTuple = [newPool: AddressLike];
  export type OutputTuple = [newPool: string];
  export interface OutputObject {
    newPool: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WooRouterSwapEvent {
  export type InputTuple = [
    swapType: BigNumberish,
    fromToken: AddressLike,
    toToken: AddressLike,
    fromAmount: BigNumberish,
    toAmount: BigNumberish,
    from: AddressLike,
    to: AddressLike,
    rebateTo: AddressLike
  ];
  export type OutputTuple = [
    swapType: bigint,
    fromToken: string,
    toToken: string,
    fromAmount: bigint,
    toAmount: bigint,
    from: string,
    to: string,
    rebateTo: string
  ];
  export interface OutputObject {
    swapType: bigint;
    fromToken: string;
    toToken: string;
    fromAmount: bigint;
    toAmount: bigint;
    from: string;
    to: string;
    rebateTo: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface WoofiRouter extends BaseContract {
  connect(runner?: ContractRunner | null): WoofiRouter;
  waitForDeployment(): Promise<this>;

  interface: WoofiRouterInterface;

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

  WETH: TypedContractMethod<[], [string], "view">;

  externalSwap: TypedContractMethod<
    [
      approveTarget: AddressLike,
      swapTarget: AddressLike,
      fromToken: AddressLike,
      toToken: AddressLike,
      fromAmount: BigNumberish,
      minToAmount: BigNumberish,
      to: AddressLike,
      data: BytesLike
    ],
    [bigint],
    "payable"
  >;

  inCaseTokenGotStuck: TypedContractMethod<
    [stuckToken: AddressLike],
    [void],
    "nonpayable"
  >;

  isWhitelisted: TypedContractMethod<[arg0: AddressLike], [boolean], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  querySwap: TypedContractMethod<
    [fromToken: AddressLike, toToken: AddressLike, fromAmount: BigNumberish],
    [bigint],
    "view"
  >;

  quoteToken: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setPool: TypedContractMethod<[newPool: AddressLike], [void], "nonpayable">;

  setWhitelisted: TypedContractMethod<
    [target: AddressLike, whitelisted: boolean],
    [void],
    "nonpayable"
  >;

  swap: TypedContractMethod<
    [
      fromToken: AddressLike,
      toToken: AddressLike,
      fromAmount: BigNumberish,
      minToAmount: BigNumberish,
      to: AddressLike,
      rebateTo: AddressLike
    ],
    [bigint],
    "payable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  tryQuerySwap: TypedContractMethod<
    [fromToken: AddressLike, toToken: AddressLike, fromAmount: BigNumberish],
    [bigint],
    "view"
  >;

  wooPool: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "WETH"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "externalSwap"
  ): TypedContractMethod<
    [
      approveTarget: AddressLike,
      swapTarget: AddressLike,
      fromToken: AddressLike,
      toToken: AddressLike,
      fromAmount: BigNumberish,
      minToAmount: BigNumberish,
      to: AddressLike,
      data: BytesLike
    ],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "inCaseTokenGotStuck"
  ): TypedContractMethod<[stuckToken: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "isWhitelisted"
  ): TypedContractMethod<[arg0: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "querySwap"
  ): TypedContractMethod<
    [fromToken: AddressLike, toToken: AddressLike, fromAmount: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "quoteToken"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setPool"
  ): TypedContractMethod<[newPool: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setWhitelisted"
  ): TypedContractMethod<
    [target: AddressLike, whitelisted: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "swap"
  ): TypedContractMethod<
    [
      fromToken: AddressLike,
      toToken: AddressLike,
      fromAmount: BigNumberish,
      minToAmount: BigNumberish,
      to: AddressLike,
      rebateTo: AddressLike
    ],
    [bigint],
    "payable"
  >;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "tryQuerySwap"
  ): TypedContractMethod<
    [fromToken: AddressLike, toToken: AddressLike, fromAmount: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "wooPool"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "WooPoolChanged"
  ): TypedContractEvent<
    WooPoolChangedEvent.InputTuple,
    WooPoolChangedEvent.OutputTuple,
    WooPoolChangedEvent.OutputObject
  >;
  getEvent(
    key: "WooRouterSwap"
  ): TypedContractEvent<
    WooRouterSwapEvent.InputTuple,
    WooRouterSwapEvent.OutputTuple,
    WooRouterSwapEvent.OutputObject
  >;

  filters: {
    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "WooPoolChanged(address)": TypedContractEvent<
      WooPoolChangedEvent.InputTuple,
      WooPoolChangedEvent.OutputTuple,
      WooPoolChangedEvent.OutputObject
    >;
    WooPoolChanged: TypedContractEvent<
      WooPoolChangedEvent.InputTuple,
      WooPoolChangedEvent.OutputTuple,
      WooPoolChangedEvent.OutputObject
    >;

    "WooRouterSwap(uint8,address,address,uint256,uint256,address,address,address)": TypedContractEvent<
      WooRouterSwapEvent.InputTuple,
      WooRouterSwapEvent.OutputTuple,
      WooRouterSwapEvent.OutputObject
    >;
    WooRouterSwap: TypedContractEvent<
      WooRouterSwapEvent.InputTuple,
      WooRouterSwapEvent.OutputTuple,
      WooRouterSwapEvent.OutputObject
    >;
  };
}
