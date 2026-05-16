# Server-backed storage and single-user auth

When **`VITE_AUTH_ENABLED=true`** is set at **build time**, the app requires login and uses **Postgres** as the source of truth for `AppData`. Without it, the app stays **local-first** (localStorage only), so existing Vercel deployments keep working until you opt in.

## Architecture

- **Vite** static frontend + **Vercel serverless** routes under `/api`.
- **Session**: signed JWT in an **HTTP-only** cookie (`SameSite=Lax`, `Secure` in production).
- **Password**: compared with **bcrypt** against **`APP_PASSWORD_HASH`** (never store plaintext in env as the “hash” field name implies—store the **bcrypt hash** only).
- **Data**: one row in `app_data` (id `singleton`), full JSON blob + `updated_at`. **PUT** supports optional **optimistic concurrency** via `lastKnownUpdatedAt`; mismatch → **409** with server payload (client reloads / shows toast). **`force: true`** skips the check (used for import / deliberate overwrite).

## Vercel environment variables

Set these in the Vercel project (**Settings → Environment Variables**). Use **Production** (and Preview if you want auth on preview builds).

| Variable | Required when auth on | Description |
|----------|----------------------|-------------|
| `VITE_AUTH_ENABLED` | Yes, for server mode | Must be exactly `true` so the **client** bundle includes the login gate and server persistence. |
| `APP_USERNAME` | Yes | Allowed username (e.g. `Prisken`). |
| `APP_PASSWORD_HASH` | Yes | Bcrypt hash of your password (see below). |
| `SESSION_SECRET` | Yes | Long random string (min 16 chars) for signing session cookies. |
| `DATABASE_URL` | Yes | Postgres connection string (Vercel Postgres / Neon / Supabase). |

`@vercel/postgres` reads **`POSTGRES_URL`** or **`DATABASE_URL`** depending on version; this project uses `sql` from `@vercel/postgres`, which follows the [Vercel Postgres env conventions](https://vercel.com/docs/storage/vercel-postgres). If the dashboard injects **`POSTGRES_URL`** only, that is usually enough; otherwise set **`DATABASE_URL`** explicitly to the same connection string.

## Generate `APP_PASSWORD_HASH`

From the repo root (after `npm install`):

```bash
npm run hash-password -- "<your-plaintext-password>"
```

Copy the printed line into **`APP_PASSWORD_HASH`** in Vercel. **Do not** commit the plaintext password or the hash into git if the repo is public—only store the hash in Vercel (or local `.env.local` for dev).

## Database table

Run once against your Postgres (Neon SQL editor, `psql`, etc.):

```sql
CREATE TABLE IF NOT EXISTS app_data (
  id text PRIMARY KEY,
  username text NOT NULL,
  data jsonb NOT NULL,
  version integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

The API also runs **`CREATE TABLE IF NOT EXISTS`** on first request (`ensureSchema`), but creating the table explicitly avoids surprises on cold starts.

## Local full-stack development

1. Create `.env.local` in the repo root (not committed) with the same server variables as Vercel (`APP_USERNAME`, `APP_PASSWORD_HASH`, `SESSION_SECRET`, `DATABASE_URL`, and optionally `VITE_AUTH_ENABLED=true` in `.env.local` for Vite).

2. **Option A — `vercel dev`** (recommended): serves both the app and `/api` on one origin.

   ```bash
   npm run dev:vercel
   ```

3. **Option B — Vite + proxy**: run **`vercel dev`** in one terminal (default e.g. `http://127.0.0.1:3000`), then in another:

   ```bash
   API_PROXY_TARGET=http://127.0.0.1:3000 npm run dev
   ```

   Vite proxies `/api/*` to the Vercel dev server.

## Migrating an existing browser (localStorage)

After login, the **server** is the source of truth. If this device still has data under the local storage key, **Settings** includes **“Upload this device’s local data to the server”** (with confirmation). It **replaces** the server copy—use only when you intend to promote this browser’s snapshot.

**Export JSON** remains the backup path; **Import** on server mode asks for confirmation before overwriting the server.

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Body `{ username, password }`; sets cookie. |
| POST | `/api/auth/logout` | No | Clears session cookie. |
| GET | `/api/auth/me` | No | `{ authenticated, username? }` or 401. |
| GET | `/api/app-data` | Yes | Returns `{ data, updatedAt, version }`; creates default row if missing. |
| PUT | `/api/app-data` | Yes | Body `{ data, lastKnownUpdatedAt?, force? }`. |
| POST | `/api/app-data/reset` | Yes | Resets server row to default seed data. |

## Replacing single-user auth later

All auth and DB access live under **`api/_lib/`** and **`api/auth/*`**. The client only calls `/api/*` and **`AuthContext`** / **`AppDataContext`**—swap the server implementation for a real identity provider when you add multi-user support.
