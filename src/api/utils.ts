import { Response } from 'express';

export function respondWithError(res: Response, statusCode: number, message: string) {
  respondWithJson(res, statusCode, { error: message });
}

export function respondWithJson(res: Response, statusCode: number, payload: any) {
  res.header('Content-Type', 'application/json');
  const strPaylod = JSON.stringify(payload);
  res.status(statusCode).send(strPaylod);
}
