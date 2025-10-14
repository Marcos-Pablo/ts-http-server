import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { NewChirp, chirps } from '../schema';

export async function createChirp(newChirp: NewChirp) {
  const [result] = await db.insert(chirps).values(newChirp).returning();
  return result;
}

export async function getChirps(authorId?: string, sort: 'asc' | 'desc' = 'asc') {
  const result = await db
    .select()
    .from(chirps)
    .where(authorId ? eq(chirps.userId, authorId) : undefined)
    .orderBy(sort === 'asc' ? asc(chirps.createdAt) : desc(chirps.createdAt));
  return result;
}

export async function getChirpById(chirpId: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return result;
}

export async function deleteChirpById(chirpId: string) {
  const result = await db.delete(chirps).where(eq(chirps.id, chirpId)).returning();
  return result.length > 0;
}
