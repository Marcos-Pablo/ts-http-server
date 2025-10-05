import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { handlerApiMetrics, handlerResetApiMetrics } from './api/metrics.js';
import { middlewareLogResponse, middlewareMetricInc } from './api/middleware.js';

const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use('/app', middlewareMetricInc, express.static('./src/app'));

app.get('/api/healthz', handlerReadiness);
app.get('/admin/metrics', handlerApiMetrics);
app.get('/admin/reset', handlerResetApiMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
