import ACTION_PROVIDERS from "../../constants/actionProviders";
import ACTION_TYPES from "../../constants/actionTypes";

export type Provider = (typeof ACTION_PROVIDERS)[number];

export type ActionType = (typeof ACTION_TYPES)[number];
