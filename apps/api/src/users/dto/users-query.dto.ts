import { Transform } from "class-transformer";
import { IsString, MaxLength, ValidateIf } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class UsersQueryDto extends PaginationQueryDto {
  @ValidateIf((_o, value) => value !== undefined)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  q?: string;
}
