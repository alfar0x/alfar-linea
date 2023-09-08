import Transaction from "./transaction";

class Step {
  public name: string;
  private transactions: Transaction[];

  constructor(params: { name: string; transactions: Transaction[] }) {
    const { name, transactions } = params;

    this.name = name;
    this.transactions = transactions;
  }

  push(transaction: Transaction) {
    this.transactions.push(transaction);
  }

  shift() {
    return this.transactions.shift();
  }

  isEmpty() {
    return !this.transactions.length;
  }

  createDefaultTransactionName(name: string) {
    return `${this.name}-${name}`;
  }

  toString() {
    return this.name;
  }
}

export default Step;
