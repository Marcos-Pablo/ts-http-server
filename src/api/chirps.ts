import { Request, Response } from 'express';
import { respondWithError, respondWithJson } from './utils';

const MAX_CHIRP_LENGTH = 140;
type Chirp = {
  body: string;
};

export async function handlerValidateChirp(req: Request, res: Response) {
  res.header('Content-Type', 'application/json');
  let body = '';
  let reqBody: Chirp;
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      reqBody = JSON.parse(body);
      if (!reqBody || !reqBody.body || typeof reqBody.body !== 'string') {
        respondWithError(res, 400, 'Invalid Payload');
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
      }
      respondWithError(res, 500, 'Something went wrong');
      return;
    }

    if (reqBody.body.length > MAX_CHIRP_LENGTH) {
      respondWithError(res, 400, 'Chirp is too long');
      return;
    }
    const resBody = {
      valid: true,
    };
    respondWithJson(res, 200, resBody);
    return;
  });
}
