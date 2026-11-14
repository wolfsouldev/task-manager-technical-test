import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { connect } from "../src/database/connection";
import { AppModule } from "../src/app.module";
import { setup } from "../src/setup";
import { migrateDatabase } from "../src/database/migrate";
import { seedDatabase } from "../src/database/seed";
let app: INestApplication;
let directory: string;
let userId: number;

it("pagina tareas con orden estable, filtra por responsable/estado y conserva el listado clásico", async () => {
  const other = (await request(app.getHttpServer()).post("/api/users").send({ name: "Otro responsable", email: "otro@example.test" }).expect(201)).body;
  const created = [];
  for (let index = 0; index < 13; index++) {
    created.push((await request(app.getHttpServer()).post("/api/tasks").send({
      title: `Tarea paginada ${index}`,
      assigneeId: index % 2 ? other.id : userId,
      status: index % 3 ? "done" : "pending",
    }).expect(201)).body);
  }
  const first = (await request(app.getHttpServer()).get("/api/tasks?page=1&limit=5").expect(200)).body;
  const second = (await request(app.getHttpServer()).get("/api/tasks?page=2&limit=5").expect(200)).body;
  expect(first).toMatchObject({ page: 1, limit: 5, total: 13, totalPages: 3, hasNextPage: true, hasPreviousPage: false });
  expect(first.items).toHaveLength(5);
  expect(second.items).toHaveLength(5);
  expect(new Set([...first.items, ...second.items].map(item => item.id)).size).toBe(10);
  const last = (await request(app.getHttpServer()).get("/api/tasks?page=99&limit=5").expect(200)).body;
  expect(last).toMatchObject({ page: 3, hasNextPage: false, hasPreviousPage: true });
  expect(last.items).toHaveLength(3);
  const filtered = (await request(app.getHttpServer()).get(`/api/tasks?page=1&limit=5&status=pending&assigneeId=${other.id}`).expect(200)).body;
  expect(filtered.total).toBe(2);
  expect(filtered.items.every((item: { assigneeId: number; status: string }) => item.assigneeId === other.id && item.status === "pending")).toBe(true);
  const classic = (await request(app.getHttpServer()).get(`/api/tasks?assigneeId=${other.id}`).expect(200)).body;
  expect(Array.isArray(classic)).toBe(true);
  expect(classic).toHaveLength(6);
});

it("pagina y busca usuarios en SQLite ignorando tildes/mayúsculas y tratando la búsqueda como texto literal", async () => {
  for (const [name, email] of [["ÁNA GARCÍA", "garcia@example.test"], ["Lucía Torres", "lucia@example.test"], ["Persona %_ literal", "literal@example.test"]]) {
    await request(app.getHttpServer()).post("/api/users").send({ name, email }).expect(201);
  }
  const found = (await request(app.getHttpServer()).get("/api/users?page=1&limit=1&q=garcia").expect(200)).body;
  expect(found).toMatchObject({ page: 1, total: 1, totalAll: 4, totalPages: 1 });
  expect(found.items[0].name).toBe("ÁNA GARCÍA");
  const email = (await request(app.getHttpServer()).get("/api/users?page=1&q=LUCIA%40EXAMPLE.TEST").expect(200)).body;
  expect(email.items[0].name).toBe("Lucía Torres");
  const literal = (await request(app.getHttpServer()).get("/api/users?page=1&q=%25_").expect(200)).body;
  expect(literal.total).toBe(1);
  expect(literal.items[0].name).toBe("Persona %_ literal");
  const absent = (await request(app.getHttpServer()).get("/api/users?page=100&q=no-existe").expect(200)).body;
  expect(absent).toMatchObject({ items: [], page: 1, total: 0, totalPages: 1, hasNextPage: false });
  const first = (await request(app.getHttpServer()).get("/api/users?page=1&limit=2").expect(200)).body;
  const next = (await request(app.getHttpServer()).get("/api/users?page=2&limit=2").expect(200)).body;
  expect(new Set([...first.items, ...next.items].map(item => item.id)).size).toBe(4);
});

it("rechaza parámetros de paginación, búsqueda y responsable inválidos", async () => {
  for (const path of [
    "/api/tasks?page=0", "/api/tasks?page=1.5", "/api/tasks?page=1e2",
    "/api/tasks?page=1000001", "/api/tasks?limit=0", "/api/tasks?limit=101",
    "/api/tasks?assigneeId=-1", "/api/tasks?assigneeId=abc",
    "/api/tasks?page=1&page=2", "/api/users?limit=abc",
    "/api/users?q=a&q=b", `/api/users?q=${"x".repeat(101)}`,
  ]) await request(app.getHttpServer()).get(path).expect(400);
});
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "task-manager-test-"));
  process.env.DATABASE_URL = `file:${join(directory, "test.db")}`;
  await migrateDatabase();
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = module.createNestApplication();
  setup(app);
  await app.init();
  const response = await request(app.getHttpServer())
    .post("/api/users")
    .send({ name: "Ana Test", email: " ANA@example.test " })
    .expect(201);
  userId = response.body.id;
});
afterEach(async () => {
  await app?.close();
  await rm(directory, { recursive: true, force: true });
});
it("crea tarea con responsable embebido y rechaza título o responsable inválidos", async () => {
  const response = await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "  Escribir tests  ", assigneeId: userId })
    .expect(201);
  expect(response.body).toMatchObject({
    title: "Escribir tests",
    description: "",
    status: "pending",
    assignee: { id: userId, email: "ana@example.test" },
  });
  expect(new Date(response.body.createdAt).toISOString()).toBe(
    response.body.createdAt,
  );
  await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: " ", assigneeId: userId })
    .expect(400);
  await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Tarea válida", assigneeId: 99999 })
    .expect(404);
});
it("crea, consulta y edita descripción enriquecida y responsable, conservando el resto en PATCH parcial", async () => {
  const second = await request(app.getHttpServer())
    .post("/api/users")
    .send({ name: "Carlos Test", email: "carlos@example.test" })
    .expect(201);
  const created = await request(app.getHttpServer())
    .post("/api/tasks")
    .send({
      title: "Describir tarea",
      assigneeId: userId,
      description: "<p>Contexto <strong>importante</strong></p>",
    })
    .expect(201);
  const path = `/api/tasks/${created.body.id}`;
  expect(
    (await request(app.getHttpServer()).get(path).expect(200)).body.description,
  ).toBe("<p>Contexto <strong>importante</strong></p>");
  const description =
    "<h2>Objetivo</h2><ul><li><p>Validar <em>todos</em> los cambios</p></li></ul>";
  const edited = await request(app.getHttpServer())
    .patch(path)
    .send({
      title: "  Tarea editada  ",
      description,
      assigneeId: second.body.id,
      status: "done",
    })
    .expect(200);
  expect(edited.body).toMatchObject({
    title: "Tarea editada",
    description,
    status: "done",
    assigneeId: second.body.id,
    assignee: { id: second.body.id, name: "Carlos Test" },
    createdAt: created.body.createdAt,
  });
  expect(edited.body.updatedAt >= created.body.updatedAt).toBe(true);
  await request(app.getHttpServer())
    .patch(path)
    .send({ title: "Solo cambia el título" })
    .expect(200);
  expect(
    (await request(app.getHttpServer()).get(path).expect(200)).body,
  ).toMatchObject({
    title: "Solo cambia el título",
    description,
    assigneeId: second.body.id,
    status: "done",
  });
  await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(204);
  await request(app.getHttpServer())
    .delete(`/api/users/${second.body.id}`)
    .expect(409);
  // Reopen the same temporary DB: the full description/assignee must persist.
  await app.close();
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = module.createNestApplication();
  setup(app);
  await app.init();
  expect(
    (await request(app.getHttpServer()).get(path).expect(200)).body,
  ).toMatchObject({ description, assigneeId: second.body.id, status: "done" });
  await request(app.getHttpServer())
    .patch(path)
    .send({ description: "" })
    .expect(200);
  expect(
    (await request(app.getHttpServer()).get(path).expect(200)).body.description,
  ).toBe("");
});
it("limpia HTML peligroso en alta y edición sin perder el formato permitido", async () => {
  const dirty =
    '<h2 style="position:fixed">Resumen</h2><p onclick="alert(1)"><strong>Seguro</strong><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">Texto</a><iframe src="https://example.test"></iframe></p>';
  const result = await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Validar HTML", assigneeId: userId, description: dirty })
    .expect(201);
  expect(result.body.description).toBe(
    "<h2>Resumen</h2><p><strong>Seguro</strong>Texto</p>",
  );
  const edited = await request(app.getHttpServer())
    .patch(`/api/tasks/${result.body.id}`)
    .send({
      description:
        '<p data-x="x"><em onmouseover="alert(1)">Limpio</em><svg><script>alert(1)</script></svg></p>',
    })
    .expect(200);
  expect(edited.body.description).toBe("<p><em>Limpio</em></p>");
  expect(
    (await request(app.getHttpServer()).get("/api/tasks").expect(200)).body[0]
      .description,
  ).toBe(edited.body.description);
});
it("valida detalle y PATCH de tarea sin aplicar escrituras parciales inválidas", async () => {
  const created = await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Original intacta", assigneeId: userId })
    .expect(201);
  const path = `/api/tasks/${created.body.id}`;
  for (const body of [
    {},
    { title: null },
    { title: " " },
    { description: null },
    { description: 12 },
    { description: "a".repeat(20_001) },
    { description: "<".repeat(7000) },
    { assigneeId: 0 },
    { assigneeId: "1" },
    { status: "bad" },
    { extra: true },
  ]) {
    await request(app.getHttpServer()).patch(path).send(body).expect(400);
  }
  await request(app.getHttpServer())
    .patch(path)
    .send({ title: "No debe guardarse", assigneeId: 999999 })
    .expect(404);
  expect(
    (await request(app.getHttpServer()).get(path).expect(200)).body.title,
  ).toBe("Original intacta");
  await request(app.getHttpServer()).get("/api/tasks/0").expect(400);
  await request(app.getHttpServer()).get("/api/tasks/999999").expect(404);
  await request(app.getHttpServer())
    .patch("/api/tasks/999999")
    .send({ title: "Tarea válida" })
    .expect(404);
  await request(app.getHttpServer())
    .post("/api/tasks")
    .send({
      title: "Demasiado texto",
      assigneeId: userId,
      description: "a".repeat(20_001),
    })
    .expect(400);
});
it("migra una SQLite anterior sin perder tareas, responsables ni fechas", async () => {
  const migrationsFolder = resolve(__dirname, "../drizzle");
  const journal = JSON.parse(
    await readFile(join(migrationsFolder, "meta/_journal.json"), "utf8"),
  );
  const legacyFolder = join(directory, "legacy-migrations");
  await mkdir(join(legacyFolder, "meta"), { recursive: true });
  await writeFile(
    join(legacyFolder, "meta/_journal.json"),
    JSON.stringify({ ...journal, entries: [journal.entries[0]] }),
  );
  await copyFile(
    join(migrationsFolder, `${journal.entries[0].tag}.sql`),
    join(legacyFolder, `${journal.entries[0].tag}.sql`),
  );
  const { client, db } = connect(`file:${join(directory, "legacy.db")}`);
  try {
    await migrate(db, { migrationsFolder: legacyFolder });
    await client.execute(
      "INSERT INTO users (name, email, created_at, updated_at) VALUES ('Original', 'original@example.test', '2026-11-01T12:00:00.000Z', '2026-11-02T12:00:00.000Z')",
    );
    await client.execute(
      "INSERT INTO tasks (title, status, assignee_id, created_at, updated_at) VALUES ('Tarea existente', 'in_progress', 1, '2026-11-01T12:00:00.000Z', '2026-11-02T12:00:00.000Z')",
    );
    const before = (await client.execute("SELECT * FROM tasks")).rows;
    await migrate(db, { migrationsFolder });
    await migrate(db, { migrationsFolder });
    expect((await client.execute("SELECT * FROM tasks")).rows).toEqual(
      before.map((task) => ({ ...task, description: "" })),
    );
    expect((await client.execute("SELECT name FROM users")).rows[0].name).toBe(
      "Original",
    );
  } finally {
    client.close();
  }
});
it("filtra en SQL, cambia estado y conserva datos al reabrir la aplicación", async () => {
  const first = await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Primera tarea", assigneeId: userId })
    .expect(201);
  await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Otra tarea", assigneeId: userId, status: "done" })
    .expect(201);
  const pending = await request(app.getHttpServer())
    .get("/api/tasks?status=pending")
    .expect(200);
  expect(pending.body.map((t: { id: number }) => t.id)).toEqual([
    first.body.id,
  ]);
  await request(app.getHttpServer())
    .patch(`/api/tasks/${first.body.id}/status`)
    .send({ status: "in_progress" })
    .expect(200);
  await app.close();
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = module.createNestApplication();
  setup(app);
  await app.init();
  const result = await request(app.getHttpServer())
    .get("/api/tasks?status=in_progress")
    .expect(200);
  expect(result.body[0].id).toBe(first.body.id);
});
it("normaliza email, protege eliminación y permite edición parcial", async () => {
  await request(app.getHttpServer())
    .post("/api/users")
    .send({ name: "Duplicada", email: "ANA@EXAMPLE.TEST" })
    .expect(409);
  await request(app.getHttpServer())
    .patch(`/api/users/${userId}`)
    .send({ name: "Ana Editada" })
    .expect(200);
  await request(app.getHttpServer())
    .patch(`/api/users/${userId}`)
    .send({})
    .expect(400);
  await request(app.getHttpServer())
    .patch(`/api/users/${userId}`)
    .send({ name: null })
    .expect(400);
  await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Tarea asignada", assigneeId: userId })
    .expect(201);
  await request(app.getHttpServer()).delete(`/api/users/${userId}`).expect(409);
  const free = await request(app.getHttpServer())
    .post("/api/users")
    .send({ name: "Libre", email: "libre@example.test" })
    .expect(201);
  await request(app.getHttpServer())
    .delete(`/api/users/${free.body.id}`)
    .expect(204);
});
it("rechaza filtros, IDs, estados y propiedades desconocidas", async () => {
  await request(app.getHttpServer())
    .get("/api/tasks?status=unknown")
    .expect(400);
  await request(app.getHttpServer())
    .patch("/api/tasks/0/status")
    .send({ status: "done" })
    .expect(400);
  await request(app.getHttpServer())
    .patch("/api/tasks/1.5/status")
    .send({ status: "done" })
    .expect(400);
  await request(app.getHttpServer())
    .patch("/api/tasks/999/status")
    .send({ status: "done" })
    .expect(404);
  await request(app.getHttpServer())
    .patch("/api/tasks/999/status")
    .send({ status: null })
    .expect(400);
  await request(app.getHttpServer())
    .post("/api/tasks")
    .send({ title: "Tarea válida", assigneeId: userId, extra: true })
    .expect(400);
});
it("seed dos veces no duplica ni sobreescribe cambios en registros demo", async () => {
  await seedDatabase();
  const initial = (await request(app.getHttpServer()).get("/api/tasks")).body;
  expect(initial).toHaveLength(9);
  for (const status of ["pending", "in_progress", "done"])
    expect(initial.filter((t: any) => t.status === status)).toHaveLength(3);
  const task = initial.find(
    (t: any) => t.status === "pending" && t.assigneeId === userId,
  );
  await request(app.getHttpServer())
    .patch(`/api/tasks/${task.id}/status`)
    .send({ status: "done" });
  await request(app.getHttpServer())
    .patch(`/api/users/${task.assigneeId}`)
    .send({ name: "Nombre editado", email: "editado@example.test" });
  await seedDatabase();
  const after = (await request(app.getHttpServer()).get("/api/tasks")).body;
  expect(after).toHaveLength(9);
  expect(after.find((t: any) => t.id === task.id)).toMatchObject({
    status: "done",
    assignee: { name: "Nombre editado" },
  });
  expect(
    (await request(app.getHttpServer()).get("/api/users")).body,
  ).toHaveLength(4);
});
