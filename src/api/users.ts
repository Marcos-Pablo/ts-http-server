import { Request, Response } from 'express';
import { BadRequestError } from './errors';
import { createUser, updateUser } from '../db/queries/users';
import { respondWithJson } from './utils';
import { getBearerToken, hashPassword, validateJWT } from '../auth';
import { User } from '../db/schema';
import { config } from 'src/config';

type UserParams = {
  email: string;
  password: string;
};

type UserResponse = Omit<User, 'hashedPassword'>;

export async function handlerCreateUser(req: Request, res: Response) {
  const params = req.body as UserParams;
  if (
    !params ||
    !params.email ||
    typeof params.email !== 'string' ||
    !params.password ||
    typeof params.password !== 'string'
  ) {
    throw new BadRequestError('Missing required fields');
  }

  const hashedPassword = await hashPassword(params.password);
  const user = await createUser({ email: params.email, hashedPassword: hashedPassword });
  if (!user) {
    throw new Error('Could not create user');
  }

  const userResonse: UserResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  respondWithJson(res, 201, userResonse);
  return;
}

export async function handlerUpdateUser(req: Request, res: Response) {
  const params = req.body as UserParams;
  if (
    !params ||
    !params.email ||
    typeof params.email !== 'string' ||
    !params.password ||
    typeof params.password !== 'string'
  ) {
    throw new BadRequestError('Missing required fields');
  }

  const headerToken = getBearerToken(req);
  const userId = validateJWT(headerToken, config.jwt.secret);
  const hashedPassword = await hashPassword(params.password);

  const user = await updateUser(userId, params.email, hashedPassword);

  if (!user) {
    throw new Error('Could not update user');
  }

  const userResonse: UserResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  respondWithJson(res, 200, userResonse);
  return;
}
