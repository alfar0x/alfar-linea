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
    return this.shift();
  }

  public toString() {
    return this.name;
  }
}

export default Operation;
