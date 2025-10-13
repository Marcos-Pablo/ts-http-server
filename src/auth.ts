import argon2 from 'argon2';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from './api/errors';
import { Request } from 'express';
import { config } from './config';
import { randomBytes } from 'crypto';

type Payload = Pick<JwtPayload, 'iss' | 'sub' | 'iat' | 'exp'>;

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = argon2.hash(password);
  return hashedPassword;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function makeRefreshToken() {
  return randomBytes(32).toString('hex');
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    throw new BadRequestError('Malformed authorization header');
  }

  const token = authHeader.trim().split(' ');

  if (token.length != 2 || token[0] !== 'Bearer') {
    throw new BadRequestError('Malformed authorization header');
  }

  return token[1];
}

export function makeJWT(userId: string, expiresIn: number, secret: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;

  const payload = {
    iss: config.jwt.issuer,
    sub: userId,
    iat: issuedAt,
    exp: expiresAt,
  } satisfies Payload;

  const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
  return token;
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: Payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (err) {
    throw new UnauthorizedError('Invalid token');
  }

  if (decoded.iss !== config.jwt.issuer) {
    throw new UnauthorizedError('Invalid issuer');
  }

  if (!decoded.sub) {
    throw new UnauthorizedError('No user ID in token');
  }

  return decoded.sub;
}
