export type DatabaseDialect = "sqlite" | "postgresql";

export interface DatabaseConfig {
  url: string;
  dialect: DatabaseDialect;
}
