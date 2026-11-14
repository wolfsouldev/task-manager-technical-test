import { Transform } from "class-transformer";
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { normalizeEmail, trim } from "./create-user.dto";

export class UpdateUserDto {
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(trim)
  @IsString()
  @Length(2, 80)
  name?: string;
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email?: string;
}
