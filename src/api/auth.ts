import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from './errors';
import { getUserByEmail } from '../db/queries/users';
import { respondWithJson } from './utils';
import { checkPasswordHash } from '../auth';
import { User } from '../db/schema';

type AuthParams = {
  email: string;
  password: string;
};

type SignInResponse = Omit<User, 'hashedPassword'>;

export async function handlerSignIn(req: Request, res: Response) {
  const params = req.body as AuthParams;
  if (
    !params ||
    !params.email ||
    typeof params.email !== 'string' ||
    !params.password ||
    typeof params.password !== 'string'
  ) {
    throw new BadRequestError('Missing require fields');
  }

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UnauthorizedError('Incorrent email or password');
  }
  const passwordMatches = await checkPasswordHash(params.password, user.hashedPassword);
  if (!passwordMatches) {
    throw new UnauthorizedError('Incorrent email or password');
  }

  const userResonse: SignInResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  respondWithJson(res, 200, userResonse);
  return;
}
