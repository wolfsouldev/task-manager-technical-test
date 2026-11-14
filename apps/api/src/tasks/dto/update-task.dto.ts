import { Transform } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { statuses } from "../constants/task-status.constants";
import type { Status } from "../types/task-status.types";

export class UpdateTaskDto {
  @ValidateIf((_o, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @Length(3, 120, { message: "El título debe tener entre 3 y 120 caracteres" })
  title?: string;

  @ValidateIf((_o, value) => value !== undefined)
  @IsString()
  @MaxLength(20_000, {
    message: "La descripción no puede superar 20 000 caracteres HTML",
  })
  description?: string;

  @ValidateIf((_o, value) => value !== undefined)
  @IsInt()
  @Min(1)
  assigneeId?: number;

  @ValidateIf((_o, value) => value !== undefined)
  @IsIn(statuses)
  status?: Status;
}
