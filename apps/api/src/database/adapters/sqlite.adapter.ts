import { and, asc, count, desc, eq, or } from "drizzle-orm";
import { containsSearch } from "../../common/search";
import type { TaskFilter } from "../../tasks/types/task.types";
import type {
  DatabaseStore,
  StoreSession,
} from "../interfaces/database-store.interface";
import * as schema from "../schema";
import type {
  SqliteDatabase as DB,
  SqliteTransaction as TX,
} from "../types/driver.types";

const { users, tasks } = schema;
const userFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};
const taskFields = {
  id: tasks.id,
  title: tasks.title,
  description: tasks.description,
  status: tasks.status,
  assigneeId: tasks.assigneeId,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt,
  assignee: { id: users.id, name: users.name, email: users.email },
};
const userFilter = (q?: string) =>
  q
    ? or(
        containsSearch(users.name, q, "sqlite"),
        containsSearch(users.email, q, "sqlite"),
      )
    : undefined;
const taskFilter = ({ status, assigneeId }: TaskFilter) =>
  and(
    status ? eq(tasks.status, status) : undefined,
    assigneeId !== undefined ? eq(tasks.assigneeId, assigneeId) : undefined,
  );

function session(db: DB | TX): StoreSession {
  return {
    async listUsers(q, window) {
      const query = db
        .select(userFields)
        .from(users)
        .where(userFilter(q))
        .orderBy(asc(users.name), asc(users.id))
        .$dynamic();
      return window ? query.limit(window.limit).offset(window.offset) : query;
    },
    async countUsers(q) {
      return (
        await db.select({ total: count() }).from(users).where(userFilter(q))
      )[0].total;
    },
    async getUser(id) {
      return (
        await db.select(userFields).from(users).where(eq(users.id, id))
      )[0];
    },
    async insertUser(input) {
      return (await db.insert(users).values(input).returning())[0];
    },
    async updateUser(id, input) {
      return (
        await db
          .update(users)
          .set(input)
          .where(eq(users.id, id))
          .returning(userFields)
      )[0];
    },
    async deleteUser(id) {
      await db.delete(users).where(eq(users.id, id));
    },
    async hasAssignedTasks(id) {
      return (
        (
          await db
            .select({ id: tasks.id })
            .from(tasks)
            .where(eq(tasks.assigneeId, id))
            .limit(1)
        ).length > 0
      );
    },
    async listTasks(filter, window) {
      const query = db
        .select(taskFields)
        .from(tasks)
        .innerJoin(users, eq(tasks.assigneeId, users.id))
        .where(taskFilter(filter))
        .orderBy(desc(tasks.createdAt), desc(tasks.id))
        .$dynamic();
      return window ? query.limit(window.limit).offset(window.offset) : query;
    },
    async countTasks(filter) {
      return (
        await db
          .select({ total: count() })
          .from(tasks)
          .where(taskFilter(filter))
      )[0].total;
    },
    async getTask(id) {
      return (
        await db
          .select(taskFields)
          .from(tasks)
          .innerJoin(users, eq(tasks.assigneeId, users.id))
          .where(eq(tasks.id, id))
      )[0];
    },
    async insertTask(input) {
      return (
        await db.insert(tasks).values(input).returning({ id: tasks.id })
      )[0];
    },
    async updateTask(id, input) {
      return (
        await db
          .update(tasks)
          .set(input)
          .where(eq(tasks.id, id))
          .returning({ id: tasks.id })
      )[0];
    },
    async findSeedUser(key, email) {
      return (
        await db
          .select()
          .from(users)
          .where(or(eq(users.seedKey, key), eq(users.email, email)))
      )[0];
    },
    async insertSeedTask(input) {
      await db
        .insert(tasks)
        .values(input)
        .onConflictDoNothing({ target: tasks.seedKey });
    },
  };
}

export function sqliteStore(db: DB): DatabaseStore {
  return {
    ...session(db),
    transaction: (work) => db.transaction((tx) => work(session(tx))),
  };
}
