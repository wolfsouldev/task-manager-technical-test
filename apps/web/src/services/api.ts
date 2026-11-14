import type {
  ChangeTaskStatus,
  CreateTask,
  Status,
  Task,
  TaskPageQuery,
  UpdateTask,
} from "@/features/tasks/types/task.types";
import type {
  UpdateUser,
  User,
  UserInput,
  UserPageQuery,
} from "@/features/users/types/user.types";
import type { Page } from "@/types/pagination.types";

// Compatibility exports for existing consumers; definitions live with each feature.
export { statuses } from "@/features/tasks/constants/task-status.constants";
export type {
  ChangeTaskStatus,
  CreateTask,
  Status,
  Task,
  TaskFilters,
  TaskPageQuery,
  UpdateTask,
} from "@/features/tasks/types/task.types";
export type {
  UpdateUser,
  User,
  UserInput,
  UserPageQuery,
} from "@/features/users/types/user.types";
export type { Page } from "@/types/pagination.types";

function queryString(values: object) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Comprueba tu conexión.",
      0,
    );
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      Array.isArray(body.message)
        ? body.message.join(". ")
        : (body.message ?? "No se pudo completar la solicitud"),
      response.status,
      body.fieldErrors,
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  tasksPage: (query: TaskPageQuery, signal?: AbortSignal) =>
    request<Page<Task>>(`/tasks?${queryString(query)}`, { signal }),
  usersPage: (query: UserPageQuery, signal?: AbortSignal) =>
    request<Page<User>>(`/users?${queryString(query)}`, { signal }),
  tasks: (status?: Status) =>
    request<Task[]>(`/tasks${status ? `?status=${status}` : ""}`),
  createTask: (body: CreateTask) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
  task: (id: number) => request<Task>(`/tasks/${id}`),
  updateTask: ({ id, ...body }: UpdateTask) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  changeStatus: ({ id, status }: ChangeTaskStatus) =>
    request<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  users: () => request<User[]>("/users"),
  user: (id: number, signal?: AbortSignal) =>
    request<User>(`/users/${id}`, { signal }),
  createUser: (body: UserInput) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(body) }),
  updateUser: ({ id, ...body }: UpdateUser) =>
    request<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteUser: (id: number) =>
    request<void>(`/users/${id}`, { method: "DELETE" }),
};
