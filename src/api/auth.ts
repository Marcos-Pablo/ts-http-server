import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from './errors';
import { getUserByEmail } from '../db/queries/users';
import { respondWithJson } from './utils';
import { checkPasswordHash, makeJWT } from '../auth';
import { User } from '../db/schema';
import { config } from 'src/config';

type AuthParams = {
  email: string;
  password: string;
  expiresInSecond?: number;
};

type SignInResponse = Omit<User, 'hashedPassword'> & { token: string };

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

  let expiresInSecond = config.jwt.defaultDuration;
  if (
    params.expiresInSecond &&
    typeof params.expiresInSecond === 'number' &&
    params.expiresInSecond > 0 &&
    params.expiresInSecond < expiresInSecond
  ) {
    expiresInSecond = params.expiresInSecond;
  }

  const token = makeJWT(user.id, expiresInSecond, config.jwt.secret);

  const userResonse: SignInResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: token,
  };

  respondWithJson(res, 200, userResonse);
  return;
}
