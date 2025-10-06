import { Request, Response } from 'express';
import { respondWithJson } from './utils';
import { BadRequestError } from './errors';

const MAX_CHIRP_LENGTH = 140;
type Chirp = {
  body: string;
};

export async function handlerValidateChirp(req: Request, res: Response) {
  const reqBody: Chirp = req.body;
  if (!reqBody || !reqBody.body || typeof reqBody.body !== 'string') {
    throw new BadRequestError('Invalid Payload');
  }
  if (reqBody.body.length > MAX_CHIRP_LENGTH) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
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
