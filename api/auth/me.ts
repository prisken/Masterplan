import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assertAuthEnv, getSessionUser } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    assertAuthEnv();
  } catch (e) {
    res.status(503).json({ error: e instanceof Error ? e.message : 'Auth not configured' });
    return;
  }

  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.status(200).json({ authenticated: true, username: user });
}
