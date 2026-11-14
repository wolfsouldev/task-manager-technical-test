import type { useBoardTasks } from "@/features/tasks/hooks";
import type { Status, Task } from "@/features/tasks/types/task.types";

export type TaskCardProps = {
  task: Task;
  disabled: boolean;
  open: (id: number) => void;
};

export type ColumnProps = {
  status: Status;
  tasks: Task[];
  disabled: boolean;
  open: (id: number) => void;
  query: ReturnType<typeof useBoardTasks>;
};
