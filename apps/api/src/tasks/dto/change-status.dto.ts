import { Transform } from "class-transformer";
import { IsIn, IsInt, Max, Min, ValidateIf } from "class-validator";
import {
  PaginationQueryDto,
  queryInteger,
} from "../../common/dto/pagination-query.dto";
import { statuses } from "../constants/task-status.constants";
import type { Status } from "../types/task-status.types";

export class ChangeStatusDto {
  @IsIn(statuses) status!: Status;
}

export class TasksQueryDto extends PaginationQueryDto {
  @ValidateIf((_o, v) => v !== undefined) @IsIn(statuses) status?: Status;
  @ValidateIf((_o, value) => value !== undefined)
  @Transform(queryInteger)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  assigneeId?: number;
}
