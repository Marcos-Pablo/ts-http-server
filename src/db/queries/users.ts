import { db } from '../index';
import { NewUser, users } from '../schema';

export async function createUser(newUser: NewUser) {
  const [result] = await db.insert(users).values(newUser).onConflictDoNothing().returning();
  return result;
}

export async function deleteUsers() {
  await db.delete(users);
}
