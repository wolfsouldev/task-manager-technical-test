import type {
  Status,
  Task,
  TaskFilters,
} from "@/features/tasks/types/task.types";
import type { Page } from "@/types/pagination.types";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";

const matches = (task: Task, filters: TaskFilters) =>
  (!filters.status || filters.status === task.status) &&
  (filters.assigneeId === undefined || filters.assigneeId === task.assigneeId);
const sortTasks = (a: Task, b: Task) =>
  b.createdAt.localeCompare(a.createdAt) || b.id - a.id;

function metadata(page: Page<Task>, total: number): Page<Task> {
  const totalPages = Math.max(1, Math.ceil(total / page.limit));
  return {
    ...page,
    total,
    totalAll: total,
    totalPages,
    hasNextPage: page.page < totalPages,
    hasPreviousPage: page.page > 1,
  };
}

export function optimisticStatus(
  data: unknown,
  key: QueryKey,
  task: Task,
  status: Status,
): unknown {
  const updated = { ...task, status };
  if (key[1] === "list" && Array.isArray(data)) {
    return (key[2] as { status?: string } | undefined)?.status === "all"
      ? data.map((item: Task) => (item.id === task.id ? updated : item))
      : data;
  }
  if (!data || (key[1] !== "page" && key[1] !== "board")) return data;
  const filters = key[2] as TaskFilters;
  const before = matches(task, filters);
  const after = matches(updated, filters);
  if (!before && !after) return data;
  const delta = Number(after) - Number(before);
  if (key[1] === "page") {
    const page = data as Page<Task>;
    const items = page.items.filter((item) => item.id !== task.id);
    if (
      after &&
      (page.items.some((item) => item.id === task.id) ||
        (!before && page.page === 1))
    )
      items.push(updated);
    return {
      ...metadata(page, Math.max(0, page.total + delta)),
      items: items.sort(sortTasks).slice(0, page.limit),
    };
  }
  const infinite = data as InfiniteData<Page<Task>>;
  const first = infinite.pages[0];
  if (!first) return data;
  const all = new Map(
    infinite.pages.flatMap((page) => page.items).map((item) => [item.id, item]),
  );
  all.delete(task.id);
  if (after) all.set(task.id, updated);
  const items = [...all.values()].sort(sortTasks);
  return {
    ...infinite,
    pages: infinite.pages.map((page, index) => ({
      ...metadata(page, Math.max(0, first.total + delta)),
      items: items.slice(index * first.limit, (index + 1) * first.limit),
    })),
  };
}
