import { Request, Response } from 'express';
import { BadRequestError, NotFoundError } from './errors';
import { markAsRedById } from 'src/db/queries/users';

export async function handlerWebhook(req: Request, res: Response) {
  type Parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params = req.body as Parameters;
  const { event, data } = params ?? {};

  if (!event || typeof event !== 'string') {
    throw new BadRequestError('Missing required fields');
  }

  if (event !== 'user.upgraded') {
    res.status(204).send();
    return;
  }

  if (!data || typeof data !== 'object' || !data.userId || typeof data.userId !== 'string') {
    throw new BadRequestError('Missing required fields');
  }

  const updatedUser = await markAsRedById(data.userId);

  if (!updatedUser) {
    throw new NotFoundError(`Could not find user with id ${data.userId}`);
  }

  res.status(204).send();
}
