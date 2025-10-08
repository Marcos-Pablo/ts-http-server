import { config } from '../config';
import { Request, Response } from 'express';
import { deleteUsers } from '../db/queries/users';
import { ForbiddenError } from './errors';

export async function handlerResetApiMetrics(_: Request, res: Response) {
  if (config.api.platform !== 'dev') {
    throw new ForbiddenError('Reset is only allowed in dev environment.');
  }
  config.api.fileserverHits = 0;
  await deleteUsers();
  res.write('Application state reset');
  res.end();
}
