import { Request, Response } from 'express';
import { config } from '../config.js';

export async function handlerApiMetrics(req: Request, res: Response) {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(`Hits: ${config.fileserverHits}`);
}

export async function handlerResetApiMetrics(req: Request, res: Response) {
  config.fileserverHits = 0;
  res.write('Hits reset to 0');
  res.end();
}
