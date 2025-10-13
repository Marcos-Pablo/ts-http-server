import { Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from './errors';
import { getUserByEmail } from '../db/queries/users';
import { respondWithJson } from './utils';
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from '../auth';
import { User } from '../db/schema';
import { config } from 'src/config';
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from 'src/db/queries/refresh-tokens';

type AuthParams = {
  email: string;
  password: string;
};

type SignInResponse = Omit<User, 'hashedPassword'> & { token: string; refreshToken: string };

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

  const token = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
  const refreshToken = makeRefreshToken();

  await createRefreshToken(user.id, refreshToken);

  const userResonse: SignInResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    isChirpyRed: user.isChirpyRed,
    token: token,
    refreshToken: refreshToken,
  };

  respondWithJson(res, 200, userResonse);
  return;
}

export async function handlerRefresh(req: Request, res: Response) {
  const headerToken = getBearerToken(req);
  const refreshToken = await getRefreshToken(headerToken);

  if (!refreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const accessToken = makeJWT(refreshToken.userId, config.jwt.defaultDuration, config.jwt.secret);
  respondWithJson(res, 200, { token: accessToken });
}

export async function handlerRevoke(req: Request, res: Response) {
  const headerToken = getBearerToken(req);
  await revokeRefreshToken(headerToken);

  res.status(204).send();
}
