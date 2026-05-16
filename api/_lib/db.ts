import { sql } from '@vercel/postgres';

const ROW_ID = 'singleton';

export async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS app_data (
      id text PRIMARY KEY,
      username text NOT NULL,
      data jsonb NOT NULL,
      version integer NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

export async function getRow(): Promise<{
  data: unknown;
  version: number;
  updated_at: string;
} | null> {
  const r = await sql`
    SELECT data, version, updated_at::text as updated_at
    FROM app_data
    WHERE id = ${ROW_ID}
    LIMIT 1
  `;
  const row = r.rows[0] as { data: unknown; version: number; updated_at: string } | undefined;
  return row ?? null;
}

export async function insertRow(
  username: string,
  dataJson: string,
  version: number
): Promise<void> {
  await sql`
    INSERT INTO app_data (id, username, data, version, updated_at)
    VALUES (${ROW_ID}, ${username}, ${dataJson}::jsonb, ${version}, now())
  `;
}

export async function updateRow(
  username: string,
  dataJson: string,
  version: number
): Promise<void> {
  await sql`
    UPDATE app_data
    SET username = ${username},
        data = ${dataJson}::jsonb,
        version = ${version},
        updated_at = now()
    WHERE id = ${ROW_ID}
  `;
}

export async function upsertRow(
  username: string,
  dataJson: string,
  version: number
): Promise<void> {
  await sql`
    INSERT INTO app_data (id, username, data, version, updated_at)
    VALUES (${ROW_ID}, ${username}, ${dataJson}::jsonb, ${version}, now())
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      data = EXCLUDED.data,
      version = EXCLUDED.version,
      updated_at = now()
  `;
}

export async function deleteRow(): Promise<void> {
  await sql`DELETE FROM app_data WHERE id = ${ROW_ID}`;
}
