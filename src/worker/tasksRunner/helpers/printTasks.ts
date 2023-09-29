import { Table } from "console-table-printer";
import { RowOptionsRaw } from "console-table-printer/dist/src/utils/table-helpers";

import Task, { TaskStatus } from "../../../core/task";

type ColumnId =
  | "idx"
  | "name"
  | "status"
  | "txs"
  | "fee"
  | "operations"
  | "address";

type Column = {
  name: ColumnId;
  title?: string;
};

const columns: Column[] = [
  { name: "idx" },
  { name: "name" },
  { name: "status" },
  { name: "txs" },
  { name: "fee" },
  { name: "operations", title: "current operations" },
  { name: "address" },
];

type Row = Record<ColumnId, string>;

const colors: Record<TaskStatus, string> = {
  TODO: "cyan",
  IN_PROGRESS: "yellow",
  WAITING: "blue",
  INSUFFICIENT_BALANCE: "red",
  FEE_LIMIT: "red",
  DONE: "green",
};

const transform = (task: Task): readonly [Row, RowOptionsRaw] => {
  const { account, status, txsDone, totalFeeStr } = task;

  const { name, address, fileIndex } = account;

  const row: Row = {
    idx: String(fileIndex + 1),
    name,
    status,
    txs: txsDone,
    fee: totalFeeStr,
    operations: task.operationsString(true),
    address,
  };

  const opts: RowOptionsRaw = { color: colors[status] };

  return [row, opts];
};

const printTasks = (tasks: readonly Task[]) => {
  const alignedColumns = columns.map((column) => ({
    alignment: "left",
    ...column,
  }));

  const p = new Table({ columns: alignedColumns });

  for (const task of tasks) {
    const [row, opts] = transform(task);

    p.addRow(row, opts);
  }

  p.printTable();
};

export default printTasks;
