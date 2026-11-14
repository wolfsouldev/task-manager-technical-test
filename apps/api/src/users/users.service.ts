import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { databaseError } from "../common/database-error";
import { pageBounds, pageResult } from "../common/pagination";
import { DatabaseService } from "../database/database.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersQueryDto } from "./dto/users-query.dto";

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}
  private get store() {
    return this.database.store;
  }
  list(q?: string) {
    return this.store.listUsers(q);
  }
  async listPage(query: UsersQueryDto) {
    return this.store.transaction(async (tx) => {
      const total = await tx.countUsers(query.q);
      const totalAll = query.q ? await tx.countUsers() : total;
      const bounds = pageBounds(total, query);
      return pageResult(await tx.listUsers(query.q, bounds), bounds, totalAll);
    });
  }
  async create(body: CreateUserDto) {
    try {
      const { seedKey: _seedKey, ...user } = await this.store.insertUser(body);
      return user;
    } catch (e) {
      databaseError(e);
    }
  }
  async get(id: number) {
    const user = await this.store.getUser(id);
    if (!user) throw new NotFoundException("Usuario no encontrado");
    return user;
  }
  async update(id: number, body: UpdateUserDto) {
    if (body.name === undefined && body.email === undefined)
      throw new BadRequestException("Indica nombre o correo para actualizar");
    try {
      const user = await this.store.updateUser(id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
      if (!user) throw new NotFoundException("Usuario no encontrado");
      return user;
    } catch (e) {
      databaseError(e);
    }
  }
  async remove(id: number) {
    await this.get(id);
    if (await this.store.hasAssignedTasks(id))
      throw new ConflictException(
        "No se puede eliminar: el usuario tiene tareas asignadas",
      );
    try {
      await this.store.deleteUser(id);
    } catch (e) {
      databaseError(e);
    }
  }
}
