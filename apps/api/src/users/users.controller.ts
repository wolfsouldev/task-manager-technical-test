import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { PositiveIdPipe } from "../common/positive-id.pipe";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersQueryDto } from "./dto/users-query.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get() list(@Query() query: UsersQueryDto) {
    return query.page !== undefined || query.limit !== undefined
      ? this.service.listPage(query)
      : this.service.list(query.q);
  }
  @Post() create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }
  @Get(":id") get(@Param("id", PositiveIdPipe) id: number) {
    return this.service.get(id);
  }
  @Patch(":id") update(
    @Param("id", PositiveIdPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.service.update(id, body);
  }
  @Delete(":id") @HttpCode(204) remove(
    @Param("id", PositiveIdPipe) id: number,
  ) {
    return this.service.remove(id);
  }
}
