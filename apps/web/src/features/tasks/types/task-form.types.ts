import type { Task } from "@/features/tasks/types/task.types";
import type { z } from "zod";
import type { taskFormSchema } from "../schemas/task-form.schema";

export type TaskFormProps = {
  task?: Task;
  onSuccess: () => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

export type TaskFormValues = z.infer<typeof taskFormSchema>;
