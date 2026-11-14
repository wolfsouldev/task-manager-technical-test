import { z } from "zod";
import { statuses } from "../constants/task-status.constants";
import { DESCRIPTION_LIMIT } from "../description";

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Escribe al menos 3 caracteres")
    .max(120, "Máximo 120 caracteres"),
  assigneeId: z
    .number({ error: "Selecciona un responsable" })
    .int()
    .positive("Selecciona un responsable"),
  status: z.enum(statuses),
  description: z
    .string()
    .max(
      DESCRIPTION_LIMIT,
      "La descripción no puede superar 20 000 caracteres HTML",
    ),
});
