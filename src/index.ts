import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { handlerApiMetrics, handlerResetApiMetrics } from './api/metrics.js';
import { errorHandlingMidleware, middlewareLogResponse, middlewareMetricInc } from './api/middlewares.js';
import { handlerValidateChirp } from './api/chirps.js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from './config.js';

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponse);
app.use('/app', middlewareMetricInc, express.static('./src/app'));

app.get('/api/healthz', (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});

app.get('/admin/metrics', (req, res, next) => {
  Promise.resolve(handlerApiMetrics(req, res).catch(next));
});
app.post('/admin/reset', async (req, res, next) => {
  Promise.resolve(handlerResetApiMetrics(req, res).catch(next));
});

app.post('/api/validate_chirp', (req, res, next) => {
  Promise.resolve(handlerValidateChirp(req, res).catch(next));
});

app.use(errorHandlingMidleware);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
