import { db } from '../index';
import { NewChirp, chirps } from '../schema';

export async function createChirp(newChirp: NewChirp) {
  const [result] = await db.insert(chirps).values(newChirp).returning();
  return result;
}
