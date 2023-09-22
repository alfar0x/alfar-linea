import Queue from "./queue";
import RunnableTransaction from "./transaction";

class Step extends Queue<RunnableTransaction> {
  public name: string;

  public constructor(params: { name: string; txs?: RunnableTransaction[] }) {
    const { name, txs } = params;

    super(txs);

    this.name = name;
  }

  public toString() {
    return this.storage.map(String).join(" -> ");
  }

  public getNextTransaction() {
    return this.shift();
  }
}

export default Step;
