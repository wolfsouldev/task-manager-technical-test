import { sql } from "drizzle-orm";
import {
  check,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { statuses } from "./model";

export { statuses, type Status } from "./model";

const timestamps = () => ({
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    seedKey: text("seed_key").unique(),
    ...timestamps(),
  },
  (t) => [
    check("user_name_length", sql`length(trim(${t.name})) between 2 and 80`),
    uniqueIndex("email_nocase").on(sql`lower(${t.email})`),
  ],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status", { enum: statuses }).notNull().default("pending"),
    assigneeId: integer("assignee_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    seedKey: text("seed_key").unique(),
    ...timestamps(),
  },
  (t) => [
    check(
      "task_status",
      sql`${t.status} in ('pending', 'in_progress', 'done')`,
    ),
    check("task_title_length", sql`length(trim(${t.title})) between 3 and 120`),
  ],
);
