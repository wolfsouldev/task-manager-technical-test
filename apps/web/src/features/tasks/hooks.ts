import type {
  Status,
  Task,
  TaskPageQuery,
} from "@/features/tasks/types/task.types";
import { api } from "@/services/api";
import {
  keepPreviousData,
  useInfiniteQuery,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { optimisticStatus } from "./optimistic-status";

export const taskKey = (status?: Status) =>
  ["tasks", "list", { status: status ?? "all" }] as const;
export const useTasks = (status?: Status) =>
  useQuery({ queryKey: taskKey(status), queryFn: () => api.tasks(status) });
export const useTaskPage = (query: TaskPageQuery) =>
  useQuery({
    queryKey: ["tasks", "page", query],
    queryFn: ({ signal }) => api.tasksPage(query, signal),
    placeholderData: (previous, previousQuery) => {
      const old = previousQuery?.queryKey[2] as TaskPageQuery | undefined;
      return old?.status === query.status &&
        old?.assigneeId === query.assigneeId
        ? keepPreviousData(previous)
        : undefined;
    },
  });
export const useBoardTasks = (status: Status, assigneeId?: number) =>
  useInfiniteQuery({
    queryKey: ["tasks", "board", { status, assigneeId, limit: 5 }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api.tasksPage({ status, assigneeId, limit: 5, page: pageParam }, signal),
    getNextPageParam: (last) => (last.hasNextPage ? last.page + 1 : undefined),
  });
export function useChangeTaskStatus() {
  const client = useQueryClient();
  const locked = useRef(false);
  const pending = useIsMutating({ mutationKey: ["tasks"] }) > 0;
  const mutation = useMutation({
    mutationKey: ["tasks", "status"],
    mutationFn: ({ id, status }: { id: number; status: Status; task: Task }) =>
      api.changeStatus({ id, status }),
    onMutate: async ({ task, status }) => {
      await client.cancelQueries({ queryKey: ["tasks"] });
      const snapshot = client.getQueriesData({ queryKey: ["tasks"] });
      for (const [key, data] of snapshot) {
        client.setQueryData(key, optimisticStatus(data, key, task, status));
      }
      return { snapshot };
    },
    onError: (error, _variables, context) => {
      for (const [key, data] of context?.snapshot ?? [])
        client.setQueryData(key, data);
      toast.error(error.message);
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["tasks"] }),
  });
  async function change(task: Task, status: Status) {
    if (
      task.status === status ||
      locked.current ||
      client.isMutating({ mutationKey: ["tasks"] })
    )
      return;
    locked.current = true;
    try {
      await mutation.mutateAsync({ id: task.id, status, task });
    } catch {
      /* error visible + rollback in onError */
    } finally {
      locked.current = false;
    }
  }
  return { change, pending, error: mutation.error };
}
