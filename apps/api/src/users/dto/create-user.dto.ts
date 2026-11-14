import { Transform } from "class-transformer";
import { IsEmail, IsString, Length, MaxLength } from "class-validator";

export const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @Transform(trim) @IsString() @Length(2, 80) name!: string;
  @Transform(normalizeEmail) @IsEmail() @MaxLength(254) email!: string;
}
