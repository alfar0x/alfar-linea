import { Table } from "console-table-printer";
import { RowOptionsRaw } from "console-table-printer/dist/src/utils/table-helpers";

import Task, { TaskStatus } from "./task";

type Row = {
  idx: number;
  name: string;
  status: TaskStatus;
  txs: string;
  operations: string;
};

const colors: Record<TaskStatus, string> = {
  TODO: "cyan",
  IN_PROGRESS: "yellow",
  INSUFFICIENT_BALANCE: "red",
  WAITING: "blue",
  DONE: "green",
};

const transform = (task: Task): readonly [Row, RowOptionsRaw] => {
  const { account, status, minimumTransactionsLimit } = task;

  const { name, fileIndex, transactionsPerformed } = account;

  const operations = task.size() ? task.operationsString() : "no operations";

  const row: Row = {
    idx: fileIndex + 1,
    name,
    status,
    txs: `${transactionsPerformed}/${minimumTransactionsLimit}`,
    operations,
  };

  const opts: RowOptionsRaw = {
    color: colors[status],
  };

  return [row, opts];
};

const printTasks = (tasks: readonly Task[]) => {
  const p = new Table({
    columns: [
      { name: "idx", alignment: "left" },
      { name: "name", alignment: "left" },
      { name: "status", alignment: "left" },
      { name: "txs", alignment: "left" },
      { name: "operations", alignment: "left", title: "current operations" },
    ],
  });

  for (const task of tasks) {
    const [row, opts] = transform(task);

    p.addRow(row, opts);
  }

  p.printTable();
};

export default printTasks;
