import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[db] DATABASE_URL is not set. Copy backend/.env.example to backend/.env and set it.',
  );
}

/**
 * Hosted databases (Neon, Render, etc.) require SSL; a local Postgres does not.
 * We enable SSL automatically for any non-local connection string.
 */
const isLocal = /@(localhost|127\.0\.0\.1)\b/.test(connectionString ?? '');
const useSsl = !!connectionString && !isLocal;

/**
 * Shared PostgreSQL connection pool. The pool connects lazily, so the server
 * can start even if the database is not reachable yet.
 */
export const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client:', err.message);
});

/** Convenience helper for one-off queries. */
export function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params as never[]);
}
