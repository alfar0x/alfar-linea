import ACTION_PROVIDERS from "../../constants/actionProviders";
import ACTION_TYPES from "../../constants/actionTypes";
import RunnableTransaction from "../transaction";

export type Provider = (typeof ACTION_PROVIDERS)[number];

export type ActionType = (typeof ACTION_TYPES)[number];

export type DefaultActionResult = {
  txs: RunnableTransaction[];
};
