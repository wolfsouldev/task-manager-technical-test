import { z } from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe al menos 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Escribe un correo válido")
    .max(254),
});
