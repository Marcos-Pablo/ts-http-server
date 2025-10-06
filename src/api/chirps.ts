import { Request, Response } from 'express';
import { respondWithError, respondWithJson } from './utils';

const MAX_CHIRP_LENGTH = 140;
type Chirp = {
  body: string;
};

export async function handlerValidateChirp(req: Request, res: Response) {
  const reqBody: Chirp = req.body;
  if (!reqBody || !reqBody.body || typeof reqBody.body !== 'string') {
    respondWithError(res, 400, 'Invalid Payload');
    return;
  }
  if (reqBody.body.length > MAX_CHIRP_LENGTH) {
    respondWithError(res, 400, 'Chirp is too long');
    return;
  }

  const words = reqBody.body.split(' ');
  const cleanedWords: string[] = [];
  const profaneWords = new Set(['kerfuffle', 'sharbert', 'fornax']);

  for (const word of words) {
    const cleanedWord = profaneWords.has(word.toLowerCase()) ? '****' : word;
    const suffix = cleanedWords.length > 0 ? ' ' : '';
    cleanedWords.push(suffix + cleanedWord);
  }
  respondWithJson(res, 200, { cleanedBody: cleanedWords.join('') });
  return;
}
