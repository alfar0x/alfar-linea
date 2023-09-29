import Queue from "./queue";
import RunnableTransaction from "./transaction";

class Step extends Queue<RunnableTransaction> {
  public readonly name: string;

  public constructor(params: { name: string; txs?: RunnableTransaction[] }) {
    const { name, txs } = params;

    super(txs);

    this.name = name;
  }

  public toString() {
    return this.name;
  }

  public getNextTransaction() {
    if (this.isEmpty()) {
      throw new Error("step is empty");
    }

    const transaction = this.shift();

    if (!transaction) {
      throw new Error(`transaction is not found`);
    }

    return transaction;
  }
}

export default Step;
