import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { handlerApiMetrics, handlerResetApiMetrics } from './api/metrics.js';
import { errorHandlingMidleware, middlewareLogResponse, middlewareMetricInc } from './api/middlewares.js';
import { handlerValidateChirp } from './api/chirps.js';

const app = express();
const PORT = 8080;

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
