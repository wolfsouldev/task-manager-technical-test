import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";

@Module({ imports: [DatabaseModule, TasksModule, UsersModule] })
export class AppModule {}
