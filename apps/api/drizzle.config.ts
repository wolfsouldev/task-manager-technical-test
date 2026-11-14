import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { databaseConfig } from "./src/database/config";
const { dialect, url } = databaseConfig();
export default defineConfig(dialect === "postgresql" ? {
  schema: "./src/database/schema.postgres.ts",
  out: "./drizzle-postgres",
  dialect: "postgresql",
  dbCredentials: { url },
} : {
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url },
});
