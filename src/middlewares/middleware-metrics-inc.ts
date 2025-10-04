import { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

export function middlewareMetricInc(req: Request, res: Response, next: NextFunction) {
  config.fileserverHits++;
  next();
}
