import { Transform, type TransformFnParams } from "class-transformer";
import { IsInt, Max, Min, ValidateIf } from "class-validator";

export const queryInteger = ({ value }: TransformFnParams) =>
  typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;

export class PaginationQueryDto {
  @ValidateIf((_o, value) => value !== undefined)
  @Transform(queryInteger)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  page?: number;

  @ValidateIf((_o, value) => value !== undefined)
  @Transform(queryInteger)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
