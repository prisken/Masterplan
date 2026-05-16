import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createDefaultData } from '../../src/data/seedData';
import type { AppData } from '../../src/types';
import { normalizeAppData } from '../../src/services/normalizeAppData';
import { assertAuthEnv, getSessionUser } from '../_lib/auth';
import { ensureSchema, getRow, insertRow, upsertRow } from '../_lib/db';

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
    res.status(503).json({
      error: e instanceof Error ? e.message : 'Database unavailable',
      hint: 'Set DATABASE_URL or POSTGRES_URL on Vercel and run the SQL from SERVER_STORAGE_SETUP.md',
    });
    return;
  }

  if (req.method === 'GET') {
    let row = await getRow();
    if (!row) {
      const fresh = normalizeAppData(createDefaultData() as Partial<AppData>);
      await insertRow(user, JSON.stringify(fresh), fresh.version);
      row = await getRow();
    }
    if (!row) {
      res.status(500).json({ error: 'Failed to initialize row' });
      return;
    }
    const updatedAt = new Date(row.updated_at).toISOString();
    res.status(200).json({
      data: row.data as AppData,
      updatedAt,
      version: row.version,
    });
    return;
  }

  if (req.method === 'PUT') {
    const body = parseBody(req);
    const raw = body.data as Partial<AppData> | undefined;
    if (!raw || typeof raw !== 'object') {
      res.status(400).json({ error: 'Missing data object' });
      return;
    }
    const normalized = normalizeAppData(raw);
    const lastKnown =
      typeof body.lastKnownUpdatedAt === 'string' ? body.lastKnownUpdatedAt : undefined;
    const force = body.force === true;

    const existing = await getRow();
    if (!force && lastKnown && existing) {
      const serverIso = new Date(existing.updated_at).toISOString();
      const clientIso = new Date(lastKnown).toISOString();
      if (Number.isNaN(Date.parse(lastKnown)) || serverIso !== clientIso) {
        res.status(409).json({
          error: 'stale_write',
          serverUpdatedAt: serverIso,
          data: existing.data as AppData,
        });
        return;
      }
    }

    await upsertRow(user, JSON.stringify(normalized), normalized.version);
    const next = await getRow();
    if (!next) {
      res.status(500).json({ error: 'Save failed' });
      return;
    }
    res.status(200).json({
      data: next.data as AppData,
      updatedAt: new Date(next.updated_at).toISOString(),
      version: next.version,
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
