import { Request, Response } from 'express';
import { BadRequestError } from './errors';
import { createUser } from '../db/queries/users';
import { respondWithJson } from './utils';
import { hashPassword } from '../auth';
import { User } from '../db/schema';

type CreateUserParams = {
  email: string;
  password: string;
};

type CreateUserResponse = Omit<User, 'hashedPassword'>;

export async function handlerCreateUser(req: Request, res: Response) {
  const params = req.body as CreateUserParams;
  if (
    !params ||
    !params.email ||
    typeof params.email !== 'string' ||
    !params.password ||
    typeof params.password !== 'string'
  ) {
    throw new BadRequestError('Missing require fields');
  }

  const hashedPassword = await hashPassword(params.password);
  const user = await createUser({ email: params.email, hashedPassword: hashedPassword });
  if (!user) {
    throw new Error('Could not create user');
  }

  const userResonse: CreateUserResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  respondWithJson(res, 201, userResonse);
  return;
}
