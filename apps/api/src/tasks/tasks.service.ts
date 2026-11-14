import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { isForeignKeyViolation } from "../common/database-error";
import { pageBounds, pageResult } from "../common/pagination";
import { DatabaseService } from "../database/database.service";
import { TasksQueryDto } from "./dto/change-status.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { sanitizeDescription } from "./task-description";
import type { Status } from "./types/task-status.types";

@Injectable()
export class TasksService {
  constructor(private readonly database: DatabaseService) {}
  private get store() {
    return this.database.store;
  }
  list(status?: Status, assigneeId?: number) {
    return this.store.listTasks({ status, assigneeId });
  }
  async listPage(query: TasksQueryDto) {
    return this.store.transaction(async (tx) => {
      const bounds = pageBounds(await tx.countTasks(query), query);
      return pageResult(await tx.listTasks(query, bounds), bounds);
    });
  }
  async get(id: number) {
    const task = await this.store.getTask(id);
    if (!task) throw new NotFoundException("Tarea no encontrada");
    return task;
  }
  private missingAssignee(): never {
    throw new NotFoundException({
      message: "Responsable no encontrado",
      fieldErrors: { assigneeId: "El responsable ya no existe" },
    });
  }
  private async assertAssignee(id: number) {
    if (!(await this.store.getUser(id))) this.missingAssignee();
  }
  async create(input: CreateTaskDto) {
    await this.assertAssignee(input.assigneeId);
    try {
      const task = await this.store.insertTask({
        ...input,
        description: sanitizeDescription(input.description ?? ""),
        status: input.status ?? "pending",
      });
      return await this.get(task.id);
    } catch (error) {
      // Covers a concurrent assignee deletion on either database engine.
      if (isForeignKeyViolation(error)) this.missingAssignee();
      throw error;
    }
  }
  async update(id: number, input: UpdateTaskDto) {
    if (Object.values(input).every((value) => value === undefined))
      throw new BadRequestException("Indica al menos un campo para actualizar");
    await this.get(id);
    if (input.assigneeId !== undefined)
      await this.assertAssignee(input.assigneeId);
    try {
      const task = await this.store.updateTask(id, {
        ...input,
        ...(input.description !== undefined
          ? { description: sanitizeDescription(input.description) }
          : {}),
        updatedAt: new Date().toISOString(),
      });
      if (!task) throw new NotFoundException("Tarea no encontrada");
      return await this.get(task.id);
    } catch (error) {
      if (isForeignKeyViolation(error)) this.missingAssignee();
      throw error;
    }
  }
  async changeStatus(id: number, status: Status) {
    const task = await this.store.updateTask(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
    if (!task) throw new NotFoundException("Tarea no encontrada");
    return this.get(id);
  }
}
