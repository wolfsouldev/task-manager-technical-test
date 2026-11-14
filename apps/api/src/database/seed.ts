import { connect } from "./connection";
import { migrateDatabase } from "./migrate";
import { statuses } from "./model";

const people = [
  ["Ana García", "ana@example.test"],
  ["Carlos Pérez", "carlos@example.test"],
  ["Lucía Torres", "lucia@example.test"],
  ["David Ruiz", "david@example.test"],
];
const titles = [
  "Documentar los endpoints de la API",
  "Diseñar el formulario de tareas",
  "Preparar el entorno Docker",
  "Implementar el filtro por estado",
  "Conectar el tablero con la API",
  "Escribir pruebas de integración",
  "Definir el modelo de datos",
  "Configurar el monorepo",
  "Validar los campos del servidor",
];
export async function seedDatabase() {
  await migrateDatabase();
  const connection = connect();
  try {
    await connection.initialize();
    await connection.store.transaction(async (tx) => {
      const ids: number[] = [];
      for (const [index, [name, email]] of people.entries()) {
        const seedKey = `demo-user-${index}`;
        let user = await tx.findSeedUser(seedKey, email);
        if (!user) user = await tx.insertUser({ name, email, seedKey });
        if (user.seedKey === null) await tx.updateUser(user.id, { seedKey });
        ids.push(user.id);
      }
      for (const [index, title] of titles.entries()) {
        await tx.insertSeedTask({
          title,
          assigneeId: ids[index % ids.length],
          status: statuses[Math.floor(index / 3)],
          seedKey: `demo-task-${index}`,
        });
      }
    });
    console.log("Seed completado (sin sobrescribir registros existentes)");
  } finally {
    await connection.close();
  }
}
if (require.main === module)
  seedDatabase().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
