import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { middlewareLogResponse } from './middlewares/middleware-log-responses.js';
import { middlewareMetricInc } from './middlewares/middleware-metrics-inc.js';
import { handlerApiMetrics, handlerResetApiMetrics } from './api/metrics.js';

const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use('/app', middlewareMetricInc, express.static('./src/app'));

app.get('/healthz', handlerReadiness);
app.get('/metrics', handlerApiMetrics);
app.get('/reset', handlerResetApiMetrics);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
