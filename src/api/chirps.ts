import { Request, Response } from 'express';
import { respondWithJson } from './utils';
import { BadRequestError, NotFoundError } from './errors';
import { createChirp, getChirpById, getChirps } from '../db/queries/chirps';
import { NewChirp } from '../db/schema';

const MAX_CHIRP_LENGTH = 140;

export async function handlerGetChirps(_: Request, res: Response) {
  const chirps = await getChirps();

  if (!chirps) {
    throw new Error('Could not get chirps');
  }

  respondWithJson(res, 200, chirps);
  return;
}

export async function handlerGetChirpById(req: Request, res: Response) {
  const chirpId = req.params.chirpId;

  const chirp = await getChirpById(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with id ${chirpId} not found`);
  }

  respondWithJson(res, 200, chirp);
  return;
}

export async function handlerCreateChirp(req: Request, res: Response) {
  const params = req.body as Pick<NewChirp, 'body' | 'userId'>;

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
