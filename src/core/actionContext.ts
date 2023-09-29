class ActionContext {
  public readonly minWorkAmountPercent: number;
  public readonly maxWorkAmountPercent: number;
  public readonly minApproveMultiplier: number;
  public readonly maxApproveMultiplier: number;

  public constructor(params: {
    minWorkAmountPercent: number;
    maxWorkAmountPercent: number;
    minApproveMultiplier: number;
    maxApproveMultiplier: number;
  }) {
    const {
      minWorkAmountPercent,
      maxWorkAmountPercent,
      minApproveMultiplier,
      maxApproveMultiplier,
    } = params;

    this.minWorkAmountPercent = minWorkAmountPercent;
    this.maxWorkAmountPercent = maxWorkAmountPercent;
    this.minApproveMultiplier = minApproveMultiplier;
    this.maxApproveMultiplier = maxApproveMultiplier;
  }
}

export default ActionContext;
