import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assertAuthEnv, usernameMatches, verifyPassword } from '../_lib/auth';
import { buildSetCookieHeader } from '../_lib/cookie';
import { signSessionToken } from '../_lib/session';

function parseBody(req: VercelRequest): Record<string, unknown> {
  if (req.body == null) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return req.body as Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    assertAuthEnv();
  } catch (e) {
    res.status(503).json({ error: e instanceof Error ? e.message : 'Auth not configured' });
    return;
  }

  const body = parseBody(req);
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const expectedUser = process.env.APP_USERNAME!;
  if (!usernameMatches(expectedUser, username)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = await signSessionToken(expectedUser.trim());
  res.setHeader('Set-Cookie', buildSetCookieHeader(token));
  res.status(200).json({ ok: true, username: expectedUser.trim() });
}
