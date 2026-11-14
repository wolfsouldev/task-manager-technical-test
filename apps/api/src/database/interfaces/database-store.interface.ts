import type { PaginationWindow } from "../../common/types/pagination.types";
import type {
  TaskDetail,
  TaskFilter,
  TaskInput,
  TaskReference,
} from "../../tasks/types/task.types";
import type {
  PublicUser,
  UserInput,
  UserRow,
} from "../../users/types/user.types";

export interface StoreSession {
  listUsers(q?: string, window?: PaginationWindow): Promise<PublicUser[]>;
  countUsers(q?: string): Promise<number>;
  getUser(id: number): Promise<PublicUser | undefined>;
  insertUser(input: UserInput): Promise<UserRow>;
  updateUser(
    id: number,
    input: Partial<UserInput>,
  ): Promise<PublicUser | undefined>;
  deleteUser(id: number): Promise<void>;
  hasAssignedTasks(id: number): Promise<boolean>;
  listTasks(
    filter: TaskFilter,
    window?: PaginationWindow,
  ): Promise<TaskDetail[]>;
  countTasks(filter: TaskFilter): Promise<number>;
  getTask(id: number): Promise<TaskDetail | undefined>;
  insertTask(input: TaskInput): Promise<TaskReference>;
  updateTask(
    id: number,
    input: Partial<TaskInput>,
  ): Promise<TaskReference | undefined>;
  findSeedUser(key: string, email: string): Promise<UserRow | undefined>;
  insertSeedTask(input: TaskInput): Promise<void>;
}

export interface DatabaseStore extends StoreSession {
  transaction<T>(work: (session: StoreSession) => Promise<T>): Promise<T>;
}
