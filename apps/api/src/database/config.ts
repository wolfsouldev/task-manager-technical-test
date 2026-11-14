import "dotenv/config";
import type { DatabaseConfig, DatabaseDialect } from "./types/database.types";

export function databaseConfig(
  url = process.env.DATABASE_URL ?? "file:./data/tasks.db",
): DatabaseConfig {
  const dialect: DatabaseDialect = url.startsWith("file:")
    ? "sqlite"
    : /^postgres(ql)?:\/\//.test(url)
      ? "postgresql"
      : (() => {
          throw new Error(
            "DATABASE_URL debe usar file:, postgres:// o postgresql://",
          );
        })();
  return { url, dialect };
}
