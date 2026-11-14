import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";

export function setup(app: INestApplication) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: "Revisa los campos indicados",
          fieldErrors: Object.fromEntries(
            errors.map((e) => [
              e.property,
              Object.values(e.constraints ?? {}).join(". "),
            ]),
          ),
        }),
    }),
  );
  app.enableShutdownHooks();
}
