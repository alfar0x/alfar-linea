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

export type VelocoreOperationStruct = {
  poolId: BytesLike;
  tokenInformations: BytesLike[];
  data: BytesLike;
};

export type VelocoreOperationStructOutput = [
  poolId: string,
  tokenInformations: string[],
  data: string
] & { poolId: string; tokenInformations: string[]; data: string };

export interface VelocoreVaultInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "admin_addFacet"
      | "admin_pause"
      | "admin_setAuthorizer"
      | "admin_setFunctions"
      | "admin_setTreasury"
      | "attachBribe"
      | "ballotToken"
      | "emissionToken"
      | "execute"
      | "inspect"
      | "killBribe"
      | "killGauge"
      | "notifyInitialSupply"
      | "query"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "BribeAttached"
      | "BribeKilled"
      | "Convert"
      | "Gauge"
      | "GaugeKilled"
      | "Swap"
      | "UserBalance"
      | "Vote"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "admin_addFacet",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "admin_pause",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "admin_setAuthorizer",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "admin_setFunctions",
    values: [AddressLike, BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "admin_setTreasury",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "attachBribe",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "ballotToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "emissionToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "execute",
    values: [BytesLike[], BigNumberish[], VelocoreOperationStruct[]]
  ): string;
  encodeFunctionData(
    functionFragment: "inspect",
    values: [AddressLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "killBribe",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "killGauge",
    values: [AddressLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "notifyInitialSupply",
    values: [BytesLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "query",
    values: [
      AddressLike,
      BytesLike[],
      BigNumberish[],
      VelocoreOperationStruct[]
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "admin_addFacet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "admin_pause",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "admin_setAuthorizer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "admin_setFunctions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "admin_setTreasury",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "attachBribe",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ballotToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emissionToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "inspect", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "killBribe", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "killGauge", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "notifyInitialSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "query", data: BytesLike): Result;
}

export namespace BribeAttachedEvent {
  export type InputTuple = [gauge: AddressLike, bribe: AddressLike];
  export type OutputTuple = [gauge: string, bribe: string];
  export interface OutputObject {
    gauge: string;
    bribe: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BribeKilledEvent {
  export type InputTuple = [gauge: AddressLike, bribe: AddressLike];
  export type OutputTuple = [gauge: string, bribe: string];
  export interface OutputObject {
    gauge: string;
    bribe: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ConvertEvent {
  export type InputTuple = [
    pool: AddressLike,
    user: AddressLike,
    tokenRef: BytesLike[],
    delta: BigNumberish[]
  ];
  export type OutputTuple = [
    pool: string,
    user: string,
    tokenRef: string[],
    delta: bigint[]
  ];
  export interface OutputObject {
    pool: string;
    user: string;
    tokenRef: string[];
    delta: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace GaugeEvent {
  export type InputTuple = [
    pool: AddressLike,
    user: AddressLike,
    tokenRef: BytesLike[],
    delta: BigNumberish[]
  ];
  export type OutputTuple = [
    pool: string,
    user: string,
    tokenRef: string[],
    delta: bigint[]
  ];
  export interface OutputObject {
    pool: string;
    user: string;
    tokenRef: string[];
    delta: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace GaugeKilledEvent {
  export type InputTuple = [gauge: AddressLike, killed: boolean];
  export type OutputTuple = [gauge: string, killed: boolean];
  export interface OutputObject {
    gauge: string;
    killed: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SwapEvent {
  export type InputTuple = [
    pool: AddressLike,
    user: AddressLike,
    tokenRef: BytesLike[],
    delta: BigNumberish[]
  ];
  export type OutputTuple = [
    pool: string,
    user: string,
    tokenRef: string[],
    delta: bigint[]
  ];
  export interface OutputObject {
    pool: string;
    user: string;
    tokenRef: string[];
    delta: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UserBalanceEvent {
  export type InputTuple = [
    to: AddressLike,
    from: AddressLike,
    tokenRef: BytesLike[],
    delta: BigNumberish[]
  ];
  export type OutputTuple = [
    to: string,
    from: string,
    tokenRef: string[],
    delta: bigint[]
  ];
  export interface OutputObject {
    to: string;
    from: string;
    tokenRef: string[];
    delta: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VoteEvent {
  export type InputTuple = [
    pool: AddressLike,
    user: AddressLike,
    voteDelta: BigNumberish
  ];
  export type OutputTuple = [pool: string, user: string, voteDelta: bigint];
  export interface OutputObject {
    pool: string;
    user: string;
    voteDelta: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface VelocoreVault extends BaseContract {
  connect(runner?: ContractRunner | null): VelocoreVault;
  waitForDeployment(): Promise<this>;

  interface: VelocoreVaultInterface;

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

  admin_addFacet: TypedContractMethod<
    [implementation: AddressLike],
    [void],
    "nonpayable"
  >;

  admin_pause: TypedContractMethod<[t: boolean], [void], "nonpayable">;

  admin_setAuthorizer: TypedContractMethod<
    [auth_: AddressLike],
    [void],
    "nonpayable"
  >;

  admin_setFunctions: TypedContractMethod<
    [implementation: AddressLike, sigs: BytesLike[]],
    [void],
    "nonpayable"
  >;

  admin_setTreasury: TypedContractMethod<
    [treasury: AddressLike],
    [void],
    "nonpayable"
  >;

  attachBribe: TypedContractMethod<
    [gauge: AddressLike, bribe: AddressLike],
    [void],
    "nonpayable"
  >;

  ballotToken: TypedContractMethod<[], [string], "nonpayable">;

  emissionToken: TypedContractMethod<[], [string], "nonpayable">;

  execute: TypedContractMethod<
    [
      tokenRef: BytesLike[],
      deposit: BigNumberish[],
      ops: VelocoreOperationStruct[]
    ],
    [void],
    "payable"
  >;

  inspect: TypedContractMethod<
    [lens: AddressLike, data: BytesLike],
    [void],
    "nonpayable"
  >;

  killBribe: TypedContractMethod<
    [gauge: AddressLike, bribe: AddressLike],
    [void],
    "nonpayable"
  >;

  killGauge: TypedContractMethod<
    [gauge: AddressLike, t: boolean],
    [void],
    "nonpayable"
  >;

  notifyInitialSupply: TypedContractMethod<
    [arg0: BytesLike, arg1: BigNumberish, arg2: BigNumberish],
    [void],
    "nonpayable"
  >;

  query: TypedContractMethod<
    [
      user: AddressLike,
      tokenRef: BytesLike[],
      deposit: BigNumberish[],
      ops: VelocoreOperationStruct[]
    ],
    [bigint[]],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "admin_addFacet"
  ): TypedContractMethod<[implementation: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "admin_pause"
  ): TypedContractMethod<[t: boolean], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "admin_setAuthorizer"
  ): TypedContractMethod<[auth_: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "admin_setFunctions"
  ): TypedContractMethod<
    [implementation: AddressLike, sigs: BytesLike[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "admin_setTreasury"
  ): TypedContractMethod<[treasury: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "attachBribe"
  ): TypedContractMethod<
    [gauge: AddressLike, bribe: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "ballotToken"
  ): TypedContractMethod<[], [string], "nonpayable">;
  getFunction(
    nameOrSignature: "emissionToken"
  ): TypedContractMethod<[], [string], "nonpayable">;
  getFunction(
    nameOrSignature: "execute"
  ): TypedContractMethod<
    [
      tokenRef: BytesLike[],
      deposit: BigNumberish[],
      ops: VelocoreOperationStruct[]
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "inspect"
  ): TypedContractMethod<
    [lens: AddressLike, data: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "killBribe"
  ): TypedContractMethod<
    [gauge: AddressLike, bribe: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "killGauge"
  ): TypedContractMethod<
    [gauge: AddressLike, t: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "notifyInitialSupply"
  ): TypedContractMethod<
    [arg0: BytesLike, arg1: BigNumberish, arg2: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "query"
  ): TypedContractMethod<
    [
      user: AddressLike,
      tokenRef: BytesLike[],
      deposit: BigNumberish[],
      ops: VelocoreOperationStruct[]
    ],
    [bigint[]],
    "nonpayable"
  >;

  getEvent(
    key: "BribeAttached"
  ): TypedContractEvent<
    BribeAttachedEvent.InputTuple,
    BribeAttachedEvent.OutputTuple,
    BribeAttachedEvent.OutputObject
  >;
  getEvent(
    key: "BribeKilled"
  ): TypedContractEvent<
    BribeKilledEvent.InputTuple,
    BribeKilledEvent.OutputTuple,
    BribeKilledEvent.OutputObject
  >;
  getEvent(
    key: "Convert"
  ): TypedContractEvent<
    ConvertEvent.InputTuple,
    ConvertEvent.OutputTuple,
    ConvertEvent.OutputObject
  >;
  getEvent(
    key: "Gauge"
  ): TypedContractEvent<
    GaugeEvent.InputTuple,
    GaugeEvent.OutputTuple,
    GaugeEvent.OutputObject
  >;
  getEvent(
    key: "GaugeKilled"
  ): TypedContractEvent<
    GaugeKilledEvent.InputTuple,
    GaugeKilledEvent.OutputTuple,
    GaugeKilledEvent.OutputObject
  >;
  getEvent(
    key: "Swap"
  ): TypedContractEvent<
    SwapEvent.InputTuple,
    SwapEvent.OutputTuple,
    SwapEvent.OutputObject
  >;
  getEvent(
    key: "UserBalance"
  ): TypedContractEvent<
    UserBalanceEvent.InputTuple,
    UserBalanceEvent.OutputTuple,
    UserBalanceEvent.OutputObject
  >;
  getEvent(
    key: "Vote"
  ): TypedContractEvent<
    VoteEvent.InputTuple,
    VoteEvent.OutputTuple,
    VoteEvent.OutputObject
  >;

  filters: {
    "BribeAttached(address,address)": TypedContractEvent<
      BribeAttachedEvent.InputTuple,
      BribeAttachedEvent.OutputTuple,
      BribeAttachedEvent.OutputObject
    >;
    BribeAttached: TypedContractEvent<
      BribeAttachedEvent.InputTuple,
      BribeAttachedEvent.OutputTuple,
      BribeAttachedEvent.OutputObject
    >;

    "BribeKilled(address,address)": TypedContractEvent<
      BribeKilledEvent.InputTuple,
      BribeKilledEvent.OutputTuple,
      BribeKilledEvent.OutputObject
    >;
    BribeKilled: TypedContractEvent<
      BribeKilledEvent.InputTuple,
      BribeKilledEvent.OutputTuple,
      BribeKilledEvent.OutputObject
    >;

    "Convert(address,address,bytes32[],int128[])": TypedContractEvent<
      ConvertEvent.InputTuple,
      ConvertEvent.OutputTuple,
      ConvertEvent.OutputObject
    >;
    Convert: TypedContractEvent<
      ConvertEvent.InputTuple,
      ConvertEvent.OutputTuple,
      ConvertEvent.OutputObject
    >;

    "Gauge(address,address,bytes32[],int128[])": TypedContractEvent<
      GaugeEvent.InputTuple,
      GaugeEvent.OutputTuple,
      GaugeEvent.OutputObject
    >;
    Gauge: TypedContractEvent<
      GaugeEvent.InputTuple,
      GaugeEvent.OutputTuple,
      GaugeEvent.OutputObject
    >;

    "GaugeKilled(address,bool)": TypedContractEvent<
      GaugeKilledEvent.InputTuple,
      GaugeKilledEvent.OutputTuple,
      GaugeKilledEvent.OutputObject
    >;
    GaugeKilled: TypedContractEvent<
      GaugeKilledEvent.InputTuple,
      GaugeKilledEvent.OutputTuple,
      GaugeKilledEvent.OutputObject
    >;

    "Swap(address,address,bytes32[],int128[])": TypedContractEvent<
      SwapEvent.InputTuple,
      SwapEvent.OutputTuple,
      SwapEvent.OutputObject
    >;
    Swap: TypedContractEvent<
      SwapEvent.InputTuple,
      SwapEvent.OutputTuple,
      SwapEvent.OutputObject
    >;

    "UserBalance(address,address,bytes32[],int128[])": TypedContractEvent<
      UserBalanceEvent.InputTuple,
      UserBalanceEvent.OutputTuple,
      UserBalanceEvent.OutputObject
    >;
    UserBalance: TypedContractEvent<
      UserBalanceEvent.InputTuple,
      UserBalanceEvent.OutputTuple,
      UserBalanceEvent.OutputObject
    >;

    "Vote(address,address,int256)": TypedContractEvent<
      VoteEvent.InputTuple,
      VoteEvent.OutputTuple,
      VoteEvent.OutputObject
    >;
    Vote: TypedContractEvent<
      VoteEvent.InputTuple,
      VoteEvent.OutputTuple,
      VoteEvent.OutputObject
    >;
  };
}
