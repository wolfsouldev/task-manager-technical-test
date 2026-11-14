import { createClient } from "@libsql/client";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { drizzle as postgresDrizzle } from "drizzle-orm/node-postgres";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { postgresStore } from "./adapters/postgres.adapter";
import { sqliteStore } from "./adapters/sqlite.adapter";
import { databaseConfig } from "./config";
import * as schema from "./schema";
import * as postgresSchema from "./schema.postgres";

export function connect(
  url = process.env.DATABASE_URL ?? "file:./data/tasks.db",
) {
  const { dialect } = databaseConfig(url);
  if (dialect === "postgresql") {
    const client = new Pool({
      connectionString: url,
      connectionTimeoutMillis: 10_000,
    });
    const db = postgresDrizzle(client, { schema: postgresSchema });
    return {
      dialect,
      client,
      db,
      store: postgresStore(db),
      initialize: async () => {
        await client.query("SELECT 1");
      },
      close: async () => {
        await client.end();
      },
    };
  }
  const path = url.startsWith("file:/")
    ? fileURLToPath(url)
    : resolve(url.slice(5));
  mkdirSync(dirname(path), { recursive: true });
  const client = createClient({ url: `file:${path}` });
  const db = drizzle(client, { schema });
  return {
    dialect,
    client,
    db,
    store: sqliteStore(db),
    initialize: async () => {
      await client.execute("PRAGMA foreign_keys = ON");
      const result = await client.execute("PRAGMA foreign_keys");
      if (Number(result.rows[0].foreign_keys) !== 1)
        throw new Error("SQLite foreign_keys desactivado");
    },
    close: async () => {
      client.close();
    },
  };
}
