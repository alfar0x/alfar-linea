import Queue from "./queue";
import Step from "./step";

// aka similar steps

class Operation extends Queue<Step> {
  public readonly name: string;
  public constructor(params: { name: string; steps: Step[] }) {
    const { name, steps } = params;
    super(steps);
    this.name = name;
  }

  public getNextStep() {
    if (this.isEmpty()) {
      throw new Error("operation is empty");
    }

    const step = this.shift();

    if (!step) {
      throw new Error(`step is not found`);
    }

    if (step.isEmpty()) {
      throw new Error(`step is empty`);
    }

    return step;
  }

  public toString() {
    return this.name;
  }
}

export default Operation;
