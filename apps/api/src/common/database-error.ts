import { ConflictException } from "@nestjs/common";

export function hasDatabaseConstraint(
  error: unknown,
  constraint: string,
): boolean {
  let current: unknown = error;
  for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
    if ("message" in current && String(current.message).includes(constraint))
      return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export function databaseError(error: unknown): never {
  if (
    hasDatabaseConstraint(error, "UNIQUE constraint failed") ||
    hasSqlState(error, "23505")
  )
    throw new ConflictException({
      message: "Este correo ya está registrado",
      fieldErrors: { email: "Este correo ya está registrado" },
    });
  if (isForeignKeyViolation(error))
    throw new ConflictException(
      "No se puede eliminar: el usuario tiene tareas asignadas",
    );
  throw error;
}

function hasSqlState(error: unknown, code: string): boolean {
  let current = error;
  for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
    if ("code" in current && current.code === code) return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export const isForeignKeyViolation = (error: unknown) =>
  hasDatabaseConstraint(error, "FOREIGN KEY constraint failed") ||
  hasSqlState(error, "23503");
