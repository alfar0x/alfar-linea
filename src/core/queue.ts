class Queue<T> {
  protected storage: T[];

  public constructor(storage?: T[]) {
    this.storage = storage ?? [];
  }

  public push(element: T) {
    this.storage.push(element);
  }

  public pushMany(...elements: T[]) {
    this.storage.push(...elements);
  }

  public shift() {
    if (this.isEmpty()) return null;

    return this.storage.shift() as T;
  }

  public isEmpty() {
    return this.storage.length === 0;
  }

  public size() {
    return this.storage.length;
  }

  public toString() {
    return this.storage.map(String).join(", ");
  }
}

export default Queue;
