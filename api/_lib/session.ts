import { SignJWT, jwtVerify } from 'jose';

export async function signSessionToken(username: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET must be set (min 16 chars)');
  }
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifySessionToken(
  token: string
): Promise<{ username: string } | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    const sub = payload.sub;
    if (typeof sub !== 'string') return null;
    return { username: sub };
  } catch {
    return null;
  }
}
