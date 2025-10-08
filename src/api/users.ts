import { Request, Response } from 'express';
import { BadRequestError } from './errors';
import { createUser } from '../db/queries/users';
import { respondWithJson } from './utils';

export async function handlerCreateUser(req: Request, res: Response) {
  type Parameters = {
    email: string;
  };
  const params = req.body as Parameters;

  if (!params.email || typeof params.email !== 'string') {
    throw new BadRequestError('Missing required fields');
  }

  const user = await createUser({ email: params.email });
  if (!user) {
    throw new Error('Could not create user');
  }
  respondWithJson(res, 201, user);
  return;
}
