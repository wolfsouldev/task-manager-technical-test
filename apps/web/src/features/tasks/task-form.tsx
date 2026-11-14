import { LoadError, Loading } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/features/users/hooks";
import { api, ApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { RichTextEditor } from "./rich-text-editor";
import { taskFormSchema } from "./schemas/task-form.schema";
import { StatusControl } from "./status";
import type { TaskFormProps, TaskFormValues } from "./types/task-form.types";

export function TaskForm({
  task,
  onSuccess,
  onCancel,
  onDirtyChange,
}: TaskFormProps) {
  const users = useUsers();
  const client = useQueryClient();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "pending",
      // Keep the controlled field in both snapshots, even before selection.
      // Missing key vs. undefined can otherwise mark a reopened form dirty.
      assigneeId: task?.assigneeId,
    },
  });
  const dirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const busy = useIsMutating({ mutationKey: ["tasks"] }) > 0;
  const mutation = useMutation({
    mutationKey: ["tasks", "save"],
    mutationFn: task
      ? (values: TaskFormValues) => api.updateTask({ id: task.id, ...values })
      : api.createTask,
    onSuccess: async (saved) => {
      client.setQueryData(["tasks", "detail", saved.id], saved);
      await client.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(task ? "Tarea actualizada" : "Tarea creada");
      form.reset();
      onSuccess();
    },
  });
  async function submit(values: TaskFormValues) {
    if (client.isMutating({ mutationKey: ["tasks"] })) return;
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      if (error instanceof ApiError)
        for (const [key, message] of Object.entries(error.fieldErrors))
          if (key in taskFormSchema.shape)
            form.setError(key as keyof TaskFormValues, { message });
    }
  }
  if (users.isPending) return <Loading />;
  if (users.isError)
    return <LoadError error={users.error} retry={() => void users.refetch()} />;
  if (!users.data.length)
    return (
      <p className="no-users">
        Crea primero un responsable en{" "}
        <Link to="/users" onClick={onSuccess}>
          Usuarios
        </Link>
        .
      </p>
    );
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="task-editor-form"
    >
      <fieldset className="task-editor-layout" disabled={busy}>
        <div className="task-editor-main">
          <Field data-invalid={!!form.formState.errors.title}>
            <FieldLabel htmlFor="task-title">Título</FieldLabel>
            <Input
              id="task-title"
              autoFocus
              placeholder="¿Qué hay que hacer?"
              {...form.register("title")}
              aria-invalid={!!form.formState.errors.title}
              aria-describedby="task-title-error"
            />
            <FieldError
              id="task-title-error"
              errors={[form.formState.errors.title]}
            />
          </Field>
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  id="task-description-label"
                  htmlFor="task-description"
                >
                  Descripción
                </FieldLabel>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  disabled={busy}
                  invalid={fieldState.invalid}
                />
                <p id="task-description-hint" className="task-description-hint">
                  Añade contexto, pasos o notas. Puedes dar formato al texto y
                  crear listas.
                </p>
                <FieldError
                  id="task-description-error"
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
        </div>
        <aside
          className="task-editor-properties"
          aria-label="Propiedades de la tarea"
        >
          <h3>Propiedades</h3>
          <Controller
            control={form.control}
            name="assigneeId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="task-assignee">Responsable</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : undefined)
                  }
                >
                  <SelectTrigger
                    id="task-assignee"
                    ref={field.ref}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    aria-describedby="task-assignee-error task-assignee-email"
                  >
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.data.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError
                  id="task-assignee-error"
                  errors={[fieldState.error]}
                />
                <p id="task-assignee-email" className="task-assignee-email">
                  {users.data.find((user) => user.id === field.value)?.email}
                </p>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-status">
                  {task ? "Estado" : "Estado inicial"}
                </FieldLabel>
                <StatusControl
                  id="task-status"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                />
              </Field>
            )}
          />
          {task && (
            <dl className="task-metadata">
              <div>
                <dt>Identificador</dt>
                <dd>TM-{task.id}</dd>
              </div>
              <div>
                <dt>Creada</dt>
                <dd>
                  <time dateTime={task.createdAt}>
                    {new Date(task.createdAt).toLocaleString("es", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </dd>
              </div>
              <div>
                <dt>Última actualización</dt>
                <dd>
                  <time dateTime={task.updatedAt}>
                    {new Date(task.updatedAt).toLocaleString("es", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </dd>
              </div>
            </dl>
          )}
        </aside>
      </fieldset>
      {mutation.error && (
        <p role="alert" className="form-error">
          {mutation.error.message}
        </p>
      )}
      <div className="task-editor-footer">
        <p>
          {dirty
            ? "Tienes cambios sin guardar."
            : "Los cambios se guardan al confirmar."}
        </p>
        <div className="task-editor-actions">
          {onCancel && (
            <Button variant="outline" disabled={busy} onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={busy || form.formState.isSubmitting || (!!task && !dirty)}
          >
            {mutation.isPending
              ? "Guardando…"
              : task
                ? "Guardar cambios"
                : "Crear tarea"}
          </Button>
        </div>
      </div>
    </form>
  );
}
