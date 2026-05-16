import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildClearCookieHeader } from '../_lib/cookie';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Set-Cookie', buildClearCookieHeader());
  res.status(200).json({ ok: true });
}
