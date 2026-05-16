import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createDefaultData } from '../../src/data/seedData';
import type { AppData } from '../../src/types';
import { normalizeAppData } from '../../src/services/normalizeAppData';
import { assertAuthEnv, getSessionUser } from '../_lib/auth';
import { ensureSchema, getRow, upsertRow } from '../_lib/db';

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

  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    await ensureSchema();
  } catch (e) {
    res.status(503).json({ error: e instanceof Error ? e.message : 'Database unavailable' });
    return;
  }

  const fresh = normalizeAppData(createDefaultData() as Partial<AppData>);
  await upsertRow(user, JSON.stringify(fresh), fresh.version);
  const row = await getRow();
  if (!row) {
    res.status(500).json({ error: 'Reset failed' });
    return;
  }
  res.status(200).json({
    data: row.data as AppData,
    updatedAt: new Date(row.updated_at).toISOString(),
    version: row.version,
  });
}
