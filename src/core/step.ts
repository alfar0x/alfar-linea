import RunnableTransaction from "./transaction";

class Step {
  public name: string;
  private storage: RunnableTransaction[];

  public constructor(params: { name: string; txs?: RunnableTransaction[] }) {
    const { name, txs } = params;

    this.name = name;
    this.storage = txs ?? [];
  }

  public push(element: RunnableTransaction) {
    this.storage.push(element);
  }

  public shift() {
    if (this.isEmpty()) return null;

    return this.storage.shift() as RunnableTransaction;
  }

  public isEmpty() {
    return this.storage.length === 0;
  }

  public size() {
    return this.storage.length;
  }

  public toString() {
    return this.storage.map(String).join(" -> ");
  }
}

export default Step;
