import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../index';
import { refreshTokens } from '../schema';
import { config } from 'src/config';

export async function createRefreshToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshDuration);

  const [result] = await db
    .insert(refreshTokens)
    .values({
      userId: userId,
      token: token,
      expiresAt: expiresAt,
      revokedAt: null,
    })
    .returning();

  return result;
}

export async function getRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.token, token), isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, new Date())),
    )
    .limit(1);

  return result;
}

export async function revokeRefreshToken(token: string) {
  const rows = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (rows.length === 0) {
    throw new Error('Could not revoke token');
  }
}
