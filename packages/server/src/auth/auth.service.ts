import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken } from './jwt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function createAndStoreRefreshToken(userId: string) {
  // retry token creation a few times to avoid rare collisions; include a random jti to ensure uniqueness
  for (let attempt = 0; attempt < 5; attempt++) {
    const jti = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const refreshToken = signRefreshToken({ userId, jti });
    try {
      await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) } });
      return refreshToken;
    } catch (err: any) {
      // Prisma unique constraint code is P2002 — if collision, try again
      if (err.code === 'P2002' && attempt < 4) {
        continue;
      }
      throw err;
    }
  }
  throw new Error('Failed to create unique refresh token');
}

export async function registerUser(email: string, password: string, role: string | undefined, agencyId?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('User already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, role: (role as any) || 'agent', agencyId } });
  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  // persist refresh token (retry on rare collisions)
  const refreshToken = await createAndStoreRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function refreshTokens(oldRefreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: oldRefreshToken } });
  if (!stored || stored.revoked) throw new Error('Invalid refresh token');
  if (stored.expiresAt < new Date()) throw new Error('Refresh token expired');

  // create new tokens
  const accessToken = signAccessToken({ userId: stored.userId });
  // revoke old token and store new (retry create on rare collisions)
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const refreshToken = await createAndStoreRefreshToken(stored.userId);

  return { accessToken, refreshToken };
}
