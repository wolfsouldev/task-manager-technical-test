import type { PublicUser } from "../../users/types/user.types";
import type { Status } from "./task-status.types";

export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  status: Status;
  assigneeId: number;
  createdAt: string;
  updatedAt: string;
  assignee: Pick<PublicUser, "id" | "name" | "email">;
}

export type TaskInput = Pick<TaskDetail, "title" | "assigneeId"> &
  Partial<
    Pick<TaskDetail, "description" | "status" | "createdAt" | "updatedAt">
  > & { seedKey?: string | null };

export type TaskFilter = { status?: Status; assigneeId?: number };

export type TaskReference = Pick<TaskDetail, "id">;
