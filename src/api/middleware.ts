import { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

export function middlewareLogResponse(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    if (res.statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();
}

export function middlewareMetricInc(req: Request, res: Response, next: NextFunction) {
  config.fileserverHits++;
  next();
}
