import { Request, Response } from 'express';
import { respondWithJson } from './utils';
import { BadRequestError } from './errors';
import { createChirp } from '../db/queries/chirps';

const MAX_CHIRP_LENGTH = 140;

type Parameters = {
  body: string;
  userId: string;
};

export async function handlerCreateChirp(req: Request, res: Response) {
  const params: Parameters = req.body;

  if (
    !params ||
    !params.body ||
    typeof params.body !== 'string' ||
    !params.userId ||
    typeof params.userId !== 'string'
  ) {
    throw new BadRequestError('Invalid payload');
  }
  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: params.userId });

  if (!chirp) {
    throw new Error('Could not create chirp');
  }

  respondWithJson(res, 201, chirp);
  return;
}

function validateChirp(body: string) {
  if (body.length > MAX_CHIRP_LENGTH) {
    throw new BadRequestError('Chirp is too long. Max length is 140');
  }

  const words = body.split(' ');
  const cleanedWords: string[] = [];
  const profaneWords = new Set(['kerfuffle', 'sharbert', 'fornax']);

  for (const word of words) {
    const cleanedWord = profaneWords.has(word.toLowerCase()) ? '****' : word;
    const suffix = cleanedWords.length > 0 ? ' ' : '';
    cleanedWords.push(suffix + cleanedWord);
  }

  return cleanedWords.join('');
}
