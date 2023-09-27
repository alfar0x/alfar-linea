import Operation from "../../core/operation";
import Step from "../../core/step";
import Task from "../../core/task";
import RunnableTransaction from "../../core/transaction";

class WorkerState {
  private _task: Task | null;
  private _operation: Operation | null;
  private _step: Step | null;
  private _transaction: RunnableTransaction | null;

  private _prevTask: Task | null;

  public isOperationFailed: boolean;
  public isTxRun: boolean;
  public isAtLeastOneTxRun: boolean;

  public isAtLeastOnePrevTxRun: boolean;

  public constructor() {
    this._task = null;
    this._operation = null;
    this._step = null;
    this._transaction = null;

    this._prevTask = null;

    this.isOperationFailed = false;
    this.isTxRun = false;
    this.isAtLeastOneTxRun = false;

    this.isAtLeastOnePrevTxRun = false;
  }

  public get account() {
    return this.task.account;
  }

  public set task(task: Task) {
    this._task = task;
  }

  public get task() {
    if (!this._task) throw new Error(`task is not defined`);

    return this._task;
  }

  public get isDifferentTask() {
    return this._prevTask === null || !this._prevTask.isEquals(this.task);
  }

  public get operation() {
    if (!this._operation) {
      const operation = this.task.getNextOperation();

      this._operation = operation;
    }

    return this._operation;
  }

  public onOperationEnd() {
    this._prevTask = this._task;
    this.isAtLeastOnePrevTxRun = this.isAtLeastOneTxRun;

    this._task = null;
    this._operation = null;

    this.isOperationFailed = false;
    this.isAtLeastOneTxRun = false;

    this.onStepEnd();
  }

  public get step() {
    if (!this._step) {
      const step = this.operation.getNextStep();

      this._step = step;
    }

    return this._step;
  }

  public onStepEnd() {
    this._step = null;
    this.onTransactionEnd();
  }

  public get transaction() {
    if (!this._transaction) {
      const transaction = this.step.getNextTransaction();

      this._transaction = transaction;
    }

    return this._transaction;
  }

  public onTransactionEnd() {
    this._transaction = null;
    this.isTxRun = false;
  }
}

export default WorkerState;
