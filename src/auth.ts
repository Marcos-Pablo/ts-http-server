import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = argon2.hash(password);
  return hashedPassword;
}

export async function checkPasswordHash(hash: string, password: string): Promise<boolean> {
  const matches = await argon2.verify(hash, password);
  return matches;
}
