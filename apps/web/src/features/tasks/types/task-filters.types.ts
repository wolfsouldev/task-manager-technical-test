import type { TaskFilters as Filters } from "@/features/tasks/types/task.types";

export type TaskFiltersProps = Filters & {
  onChange: (change: Partial<Filters>) => void;
  includeStatus?: boolean;
};
