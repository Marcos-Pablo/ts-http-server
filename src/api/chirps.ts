import { Request, Response } from 'express';
import { respondWithJson } from './utils';
import { BadRequestError, ForbiddenError, NotFoundError } from './errors';
import { createChirp, deleteChirpById, getChirpById, getChirps } from '../db/queries/chirps';
import { NewChirp } from '../db/schema';
import { getBearerToken, validateJWT } from 'src/auth';
import { config } from 'src/config';

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

export async function handlerDeleteChirpById(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  const chirp = await getChirpById(chirpId);

  if (!chirp) {
    throw new NotFoundError(`Chirp with id ${chirpId} not found`);
  }

  const headerToken = getBearerToken(req);
  const subject = validateJWT(headerToken, config.jwt.secret);

  if (chirp.userId !== subject) {
    throw new ForbiddenError("You can't delete this chirp");
  }

  const deleted = await deleteChirpById(chirp.id);

  if (!deleted) {
    throw new Error(`Failed to delete chirp with id ${chirpId}`);
  }

  res.status(204).send();
}

export async function handlerCreateChirp(req: Request, res: Response) {
  const params = req.body as Pick<NewChirp, 'body'>;
  const bearerToken = getBearerToken(req);
  const tokenSubject = validateJWT(bearerToken, config.jwt.secret);

  if (!params || !params.body || typeof params.body !== 'string') {
    throw new BadRequestError('Invalid payload');
  }
  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: tokenSubject });

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
