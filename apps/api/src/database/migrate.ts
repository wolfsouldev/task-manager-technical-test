import { migrate } from "drizzle-orm/libsql/migrator";
import { migrate as migratePostgres } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";
import { connect } from "./connection";

export async function migrateDatabase() {
  const connection = connect();
  try {
    await connection.initialize();
    if (connection.dialect === "postgresql")
      await migratePostgres(connection.db, {
        migrationsFolder: resolve(__dirname, "../../drizzle-postgres"),
      });
    else
      await migrate(connection.db, {
        migrationsFolder: resolve(__dirname, "../../drizzle"),
      });
  } finally {
    await connection.close();
  }
}
if (require.main === module)
  migrateDatabase()
    .then(() => console.log("Migraciones aplicadas"))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
