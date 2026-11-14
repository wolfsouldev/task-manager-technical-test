import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { statuses } from "./model";

// ISO strings keep the public API identical across both drivers.
const timestamps = () => ({
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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

export const tasks = pgTable(
  "tasks",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
