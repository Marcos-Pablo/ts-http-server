import { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { respondWithError } from './utils.js';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from './errors.js';

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

export function errorHandlingMidleware(err: Error, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = 'Something went wrong on our end';

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.log(err.message);
  }
  respondWithError(res, statusCode, message);
}
