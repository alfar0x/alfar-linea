import { ActionType, Provider } from "./types";

class Action {
  public actionType: ActionType;
  public provider: Provider;
  public name: string;

  constructor(params: { provider: Provider; actionType: ActionType }) {
    const { provider, actionType } = params;
    this.provider = provider;
    this.actionType = actionType;
    this.name = `${provider}_${actionType}`;
  }
}

export default Action;
