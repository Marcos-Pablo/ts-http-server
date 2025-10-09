import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { handlerApiMetrics } from './api/metrics.js';
import { errorHandlingMidleware, middlewareLogResponse, middlewareMetricInc } from './api/middlewares.js';
import { handlerCreateChirp, handlerGetChirpById, handlerGetChirps } from './api/chirps.js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from './config.js';
import { handlerResetApiMetrics } from './api/reset.js';
import { handlerCreateUser } from './api/users.js';
import { handlerSignIn } from './api/auth.js';

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

app.post('/api/chirps', (req, res, next) => {
  Promise.resolve(handlerCreateChirp(req, res).catch(next));
});

app.get('/api/chirps', (req, res, next) => {
  Promise.resolve(handlerGetChirps(req, res).catch(next));
});

app.get('/api/chirps/:chirpId', (req, res, next) => {
  Promise.resolve(handlerGetChirpById(req, res).catch(next));
});

app.post('/api/users', (req, res, next) => {
  Promise.resolve(handlerCreateUser(req, res).catch(next));
});

app.post('/api/login', (req, res, next) => {
  Promise.resolve(handlerSignIn(req, res).catch(next));
});

app.use(errorHandlingMidleware);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
