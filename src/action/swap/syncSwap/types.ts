import { SyncswapRouter } from "../../../abi/types/web3-v1/SyncswapRouter";

type SwapMethod = SyncswapRouter["methods"]["swap"];
export type SwapPath = Parameters<SwapMethod>["0"][number];
export type SwapStep = SwapPath["0"][number];
