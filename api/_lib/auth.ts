import type { VercelRequest } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getCookie, SESSION_COOKIE_NAME } from './cookie';
import { verifySessionToken } from './session';

export function assertAuthEnv(): void {
  if (!process.env.APP_USERNAME?.trim()) {
    throw new Error('APP_USERNAME is not configured');
  }
  if (!process.env.APP_PASSWORD_HASH?.trim()) {
    throw new Error('APP_PASSWORD_HASH is not configured');
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    throw new Error('SESSION_SECRET must be set (min 16 characters)');
  }
}

export async function verifyPassword(plain: string): Promise<boolean> {
  const hash = process.env.APP_PASSWORD_HASH!;
  return bcrypt.compare(plain, hash);
}

export function usernameMatches(expected: string, given: string): boolean {
  return expected.trim() === given.trim();
}

export async function getSessionUser(req: VercelRequest): Promise<string | null> {
  const token = getCookie(req, SESSION_COOKIE_NAME);
  if (!token) return null;
  const v = await verifySessionToken(token);
  return v?.username ?? null;
}
