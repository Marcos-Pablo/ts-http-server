import { MigrationConfig } from 'drizzle-orm/migrator';

type Config = {
  api: ApiConfig;
  db: DbConfig;
  jwt: JWTConfig;
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

type JWTConfig = {
  defaultDuration: number;
  secret: string;
  issuer: string;
  refreshDuration: number;
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
  jwt: {
    defaultDuration: Number(envOrThrow('JWT_DEFAULT_DURATION')),
    secret: envOrThrow('JWT_SECRET'),
    issuer: envOrThrow('JWT_ISSUER'),
    refreshDuration: Number(envOrThrow('JWT_REFRESH_DURATION')),
  },
};

function envOrThrow(key: string) {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return envVar;
}
