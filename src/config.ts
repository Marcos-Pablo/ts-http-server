process.loadEnvFile();

type ApiConfig = {
  fileserverHits: number;
  dbUrl: string;
};

export const config: ApiConfig = {
  fileserverHits: 0,
  dbUrl: envOrThrow('DB_URL'),
};

function envOrThrow(key: string) {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return envVar;
}
