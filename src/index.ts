import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { handlerApiMetrics, handlerResetApiMetrics } from './api/metrics.js';
import { middlewareLogResponse, middlewareMetricInc } from './api/middleware.js';
import { handlerValidateChirp } from './api/chirps.js';

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponse);
app.use('/app', middlewareMetricInc, express.static('./src/app'));

app.get('/api/healthz', handlerReadiness);

app.get('/admin/metrics', handlerApiMetrics);
app.post('/admin/reset', handlerResetApiMetrics);

app.post('/api/validate_chirp', handlerValidateChirp);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
