import { Avatar, Empty, LoadError, Loading } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { statuses } from "@/features/tasks/constants/task-status.constants";
import { DescriptionPreview } from "@/features/tasks/description-preview";
import { useBoardTasks, useChangeTaskStatus } from "@/features/tasks/hooks";
import { StatusIcon, statusLabels } from "@/features/tasks/status";
import { TaskDialog } from "@/features/tasks/task-dialog";
import { TaskFilters, assigneeParam } from "@/features/tasks/task-filters";
import type { Status } from "@/features/tasks/types/task.types";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { GripVertical } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ColumnProps, TaskCardProps } from "./types/board.types";

function TaskCard({ task, disabled, open }: TaskCardProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: task.id,
    disabled,
  });
  return (
    <article
      ref={ref}
      className={`task-card ${isDragging ? "is-dragging" : ""}`}
    >
      <div className="card-top">
        <span className="task-reference">TM-{task.id}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          tapScale={1}
          ref={handleRef}
          className="drag-handle"
          aria-label={`Arrastrar ${task.title}`}
          disabled={disabled}
        >
          <GripVertical size={15} />
        </Button>
      </div>
      <h3>
        <Button
          variant="ghost"
          className="task-open"
          tapScale={1}
          hoverScale={1}
          aria-label={`Abrir tarea: ${task.title}`}
          onClick={() => open(task.id)}
        >
          {task.title}
        </Button>
      </h3>
      <DescriptionPreview html={task.description} />
      <div className="card-bottom">
        <span className="card-assignee">{task.assignee.name}</span>
        <Avatar name={task.assignee.name} id={task.assigneeId} />
      </div>
    </article>
  );
}
function Column({ status, tasks, disabled, open, query }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({ id: status });
  return (
    <section
      ref={ref}
      aria-label={statusLabels[status]}
      className={`kanban-column ${isDropTarget ? "drop-target" : ""}`}
    >
      <div className="column-heading">
        <StatusIcon status={status} />
        <h2>{statusLabels[status]}</h2>
        <span className="column-count">
          {query.data?.pages[0]?.total ?? "…"}
        </span>
      </div>
      <div className="column-cards">
        {query.isPending && <Loading />}
        {query.isError && !query.data && (
          <LoadError error={query.error} retry={() => void query.refetch()} />
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} disabled={disabled} open={open} />
        ))}
        {!tasks.length && query.data && (
          <div className="column-empty">Sin tareas por ahora</div>
        )}
      </div>
      {query.data && (
        <div className="column-pagination">
          <span>
            {tasks.length} de {query.data.pages[0].total} tareas
          </span>
          {query.isError && (
            <p role="alert" className="form-error">
              No se pudieron actualizar todas las tareas.{" "}
              <Button
                variant="link"
                onClick={() =>
                  void (query.isFetchNextPageError
                    ? query.fetchNextPage()
                    : query.refetch())
                }
              >
                Reintentar
              </Button>
            </p>
          )}
          {query.hasNextPage && (
            <Button
              variant="outline"
              disabled={query.isFetching || disabled}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Cargando…" : "Cargar más"}
              <span className="sr-only"> · {statusLabels[status]}</span>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
export function Board() {
  const [selected, setSelected] = useState<number | null>(null);
  const [params, setParams] = useSearchParams();
  const assigneeId = assigneeParam(params.get("assigneeId"));
  const pending = useBoardTasks("pending", assigneeId);
  const inProgress = useBoardTasks("in_progress", assigneeId);
  const done = useBoardTasks("done", assigneeId);
  const byStatus = { pending, in_progress: inProgress, done };
  const queries = [pending, inProgress, done];
  const tasksFor = (query: ReturnType<typeof useBoardTasks>) => [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.items)
        .map((task) => [task.id, task]) ?? [],
    ).values(),
  ];
  const allTasks = queries.flatMap(tasksFor);
  const total = queries.every((query) => query.data)
    ? queries.reduce((sum, query) => sum + query.data!.pages[0].total, 0)
    : undefined;
  const mutation = useChangeTaskStatus();
  const blocked = mutation.pending || queries.some((query) => !query.data);
  return (
    <>
      <div className="view-toolbar">
        <p className="view-description">
          Cada tarea en su lugar. Cada avance, a la vista.
        </p>
        <div className="board-toolbar-filters">
          <TaskFilters
            assigneeId={assigneeId}
            includeStatus={false}
            onChange={(change) => {
              const next = new URLSearchParams(params);
              change.assigneeId === undefined
                ? next.delete("assigneeId")
                : next.set("assigneeId", String(change.assigneeId));
              setParams(next);
            }}
          />
          <span className="task-total">
            {total === undefined ? "Cargando tareas…" : `${total} tareas`}
          </span>
        </div>
      </div>
      {mutation.error && (
        <p className="form-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      {total === 0 && (
        <Empty
          text={
            assigneeId
              ? "No hay tareas para este responsable."
              : "Tu tablero está listo. Crea tu primera tarea."
          }
        />
      )}
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled || !event.operation.target) return;
          const task = allTasks.find(
            (t) => t.id === event.operation.source?.id,
          );
          const target = event.operation.target.id;
          if (task && statuses.includes(target as Status))
            void mutation.change(task, target as Status);
        }}
      >
        <div
          className="kanban-board"
          aria-busy={queries.some((query) => query.isFetching)}
        >
          {statuses.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksFor(byStatus[status])}
              query={byStatus[status]}
              disabled={blocked}
              open={setSelected}
            />
          ))}
        </div>
      </DragDropProvider>
      <TaskDialog
        open={selected !== null}
        taskId={selected ?? undefined}
        onClose={() => setSelected(null)}
      />
      <p className="board-hint">
        <GripVertical size={14} />
        Arrastra desde el asa para cambiar de estado. Abre una tarea para editar
        sus detalles.
      </p>
    </>
  );
}
