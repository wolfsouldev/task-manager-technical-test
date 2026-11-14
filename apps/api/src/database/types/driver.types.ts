import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as sqliteSchema from "../schema";
import type * as postgresSchema from "../schema.postgres";

export type SqliteDatabase = LibSQLDatabase<typeof sqliteSchema>;
export type SqliteTransaction = Parameters<
  Parameters<SqliteDatabase["transaction"]>[0]
>[0];
export type PostgresDatabase = NodePgDatabase<typeof postgresSchema>;
export type PostgresTransaction = Parameters<
  Parameters<PostgresDatabase["transaction"]>[0]
>[0];
