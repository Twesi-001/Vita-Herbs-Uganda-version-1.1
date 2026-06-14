import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn(
    '[db] DATABASE_URL is not set. Copy server/.env.example to server/.env and set it.',
  );
}

/**
 * Shared PostgreSQL connection pool. The pool connects lazily, so the server
 * can start even if the database is not reachable yet.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
