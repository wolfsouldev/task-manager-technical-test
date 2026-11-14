import type { User } from "@/features/users/types/user.types";
import type { statuses } from "../constants/task-status.constants";

export type Status = (typeof statuses)[number];

export type Task = {
  id: number;
  title: string;
  description: string;
  status: Status;
  assigneeId: number;
  assignee: Pick<User, "id" | "name" | "email">;
  createdAt: string;
  updatedAt: string;
};

export type CreateTask = {
  title: string;
  description?: string;
  assigneeId: number;
  status: Status;
};

export type UpdateTask = Partial<CreateTask> & { id: number };

export type TaskFilters = { status?: Status; assigneeId?: number };

export type TaskPageQuery = TaskFilters & { page: number; limit: number };

export type ChangeTaskStatus = { id: number; status: Status };
