import { MigrationConfig } from 'drizzle-orm/migrator';

type Config = {
  api: ApiConfig;
  db: DbConfig;
};

type ApiConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
};

type DbConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

process.loadEnvFile();

export const config: Config = {
  api: {
    fileserverHits: 0,
    port: Number(envOrThrow('PORT')),
    platform: envOrThrow('PLATFORM'),
  },
  db: {
    url: envOrThrow('DB_URL'),
    migrationConfig: {
      migrationsFolder: './src/db/migrations/',
    },
  },
};

function envOrThrow(key: string) {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return envVar;
}
