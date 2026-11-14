import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { PositiveIdPipe } from "../common/positive-id.pipe";
import { ChangeStatusDto, TasksQueryDto } from "./dto/change-status.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Get() list(@Query() query: TasksQueryDto) {
    return query.page !== undefined || query.limit !== undefined
      ? this.service.listPage(query)
      : this.service.list(query.status, query.assigneeId);
  }

  @Post() create(@Body() body: CreateTaskDto) {
    return this.service.create(body);
  }

  @Get(":id") get(@Param("id", PositiveIdPipe) id: number) {
    return this.service.get(id);
  }

  @Patch(":id") update(
    @Param("id", PositiveIdPipe) id: number,
    @Body() body: UpdateTaskDto,
  ) {
    return this.service.update(id, body);
  }

  @Patch(":id/status") changeStatus(
    @Param("id", PositiveIdPipe) id: number,
    @Body() body: ChangeStatusDto,
  ) {
    return this.service.changeStatus(id, body.status);
  }
}
