import { Avatar, Empty, LoadError, Loading } from "@/components/feedback";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { statuses } from "@/features/tasks/constants/task-status.constants";
import type { Status } from "@/features/tasks/types/task.types";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DescriptionPreview } from "./description-preview";
import { useChangeTaskStatus, useTaskPage } from "./hooks";
import { StatusControl } from "./status";
import { TaskDialog } from "./task-dialog";
import { TaskFilters, assigneeParam } from "./task-filters";

export function TaskList() {
  const [selected, setSelected] = useState<number | null>(null);
  const [params, setParams] = useSearchParams();
  const raw = params.get("status");
  const status = statuses.includes(raw as Status) ? (raw as Status) : undefined;
  const assigneeId = assigneeParam(params.get("assigneeId"));
  const rawPage = Number(params.get("page"));
  const page =
    Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 1_000_000
      ? rawPage
      : 1;
  const rawLimit = Number(params.get("limit"));
  const limit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;
  const query = useTaskPage({ status, assigneeId, page, limit });
  function updateParams(
    values: Record<string, string | number | undefined>,
    resetPage = true,
  ) {
    const next = new URLSearchParams(params);
    if (resetPage) next.delete("page");
    for (const [key, value] of Object.entries(values))
      value === undefined ? next.delete(key) : next.set(key, String(value));
    setParams(next);
  }
  const mutation = useChangeTaskStatus();
  return (
    <>
      <div className="view-toolbar">
        <div className="view-description">
          Todas las tareas, en un solo lugar.
        </div>
        <TaskFilters
          status={status}
          assigneeId={assigneeId}
          onChange={(change) => updateParams(change)}
        />
      </div>
      {mutation.error && (
        <p role="alert" className="form-error">
          {mutation.error.message}
        </p>
      )}
      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <LoadError error={query.error} retry={() => void query.refetch()} />
      ) : !query.data.items.length ? (
        <Empty
          text={assigneeId ? "No hay tareas con estos filtros" : undefined}
        />
      ) : (
        <div className="task-list" aria-busy={query.isFetching}>
          <div className="list-heading">
            <span>Tarea</span>
            <span>Responsable</span>
            <span>Estado</span>
            <span>Creación</span>
          </div>
          {query.data.items.map((task) => (
            <article className="task-row" key={task.id}>
              <div className="task-row-title">
                <span className="task-reference">TM-{task.id}</span>
                <h2>
                  <Button
                    variant="ghost"
                    className="task-open"
                    tapScale={1}
                    hoverScale={1}
                    aria-label={`Abrir tarea: ${task.title}`}
                    onClick={() => setSelected(task.id)}
                  >
                    {task.title}
                  </Button>
                </h2>
                <DescriptionPreview html={task.description} />
              </div>
              <div className="assignee">
                <Avatar name={task.assignee.name} id={task.assigneeId} />
                <span>{task.assignee.name}</span>
              </div>
              <div className="task-interactive">
                <StatusControl
                  title={task.title}
                  value={task.status}
                  disabled={mutation.pending || query.isPlaceholderData}
                  onChange={(status) => void mutation.change(task, status)}
                />
              </div>
              <time dateTime={task.createdAt}>
                {new Date(task.createdAt).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                })}
              </time>
            </article>
          ))}
        </div>
      )}
      {query.data && !query.isError && (
        <Pagination
          data={query.data}
          limit={limit}
          label="Tareas"
          pending={query.isFetching}
          onPage={(value) => updateParams({ page: value }, false)}
          onLimit={(value) => updateParams({ limit: value })}
        />
      )}
      <TaskDialog
        open={selected !== null}
        taskId={selected ?? undefined}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
