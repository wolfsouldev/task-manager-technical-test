import { sql, type SQLWrapper } from "drizzle-orm";
import type { DatabaseDialect } from "../database/types/database.types";

export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// SQLite's lower() alone does not fold accented Spanish characters.
export function containsSearch(
  column: SQLWrapper,
  term: string,
  dialect: DatabaseDialect = "sqlite",
) {
  let expression = sql`${column}`;
  for (const character of "áÁéÉíÍóÓúÚüÜñÑ") {
    expression = sql`replace(${expression}, ${character}, ${normalizeSearch(character)})`;
  }
  return dialect === "postgresql"
    ? sql`strpos(lower(${expression}), ${normalizeSearch(term)}) > 0`
    : sql`instr(lower(${expression}), ${normalizeSearch(term)}) > 0`;
}
