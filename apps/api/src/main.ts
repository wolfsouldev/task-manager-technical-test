import { NestFactory } from "@nestjs/core";
import process from "process";
import "reflect-metadata";
import { AppModule } from "./app.module";
import { setup } from "./setup";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setup(app);
  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}

bootstrap().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
