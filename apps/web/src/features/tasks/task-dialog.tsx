import { LoadError, Loading } from "@/components/feedback";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services/api";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useRef, useState } from "react";
import type { TaskDialogProps } from "./types/task-dialog.types";

const TaskForm = lazy(() =>
  import("./task-form").then((module) => ({ default: module.TaskForm })),
);

export function TaskDialog({ open, taskId, onClose }: TaskDialogProps) {
  const [dirty, setDirty] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const pending = useIsMutating({ mutationKey: ["tasks"] }) > 0;
  const task = useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => api.task(taskId!),
    enabled: open && taskId !== undefined,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
  function close() {
    setDirty(false);
    setDiscarding(false);
    onClose();
  }
  function requestClose() {
    if (pending) return;
    if (dirty) setDiscarding(true);
    else close();
  }
  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogContent
          className="task-editor-dialog"
          onOpenAutoFocus={(event) => {
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            // With a lazy-loaded form, let its title field receive focus once ready.
            if (!taskId || task.isPending) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus();
          }}
        >
          <DialogHeader className="task-editor-header">
            <DialogTitle>
              {taskId ? `Detalle de tarea · TM-${taskId}` : "Nueva tarea"}
            </DialogTitle>
            <DialogDescription>
              {taskId
                ? "Consulta todos los detalles y edita lo que necesites."
                : "Define qué hay que hacer, añade contexto y elige un responsable."}
            </DialogDescription>
          </DialogHeader>
          <div className="task-editor-body">
            {open &&
              (taskId !== undefined && task.isPending ? (
                <Loading />
              ) : taskId !== undefined && task.isError && !task.data ? (
                <LoadError
                  error={task.error}
                  retry={() => void task.refetch()}
                />
              ) : (
                <Suspense fallback={<Loading />}>
                  <TaskForm
                    key={taskId ?? "new"}
                    task={taskId !== undefined ? task.data : undefined}
                    onSuccess={close}
                    onCancel={requestClose}
                    onDirtyChange={setDirty}
                  />
                </Suspense>
              ))}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={discarding} onOpenChange={setDiscarding}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar los cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Los cambios de esta tarea todavía no se han guardado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir editando</AlertDialogCancel>
            <Button variant="destructive" onClick={close}>
              Descartar cambios
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
