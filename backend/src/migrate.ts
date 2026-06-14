import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pool } from './db';

/**
 * Applies db/schema.sql against the configured DATABASE_URL.
 * Safe to run repeatedly — the schema uses IF NOT EXISTS / conditional seeding.
 */
async function migrate() {
  const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');

  console.log('Running migration against the database...');
  await pool.query(sql);
  console.log('Migration complete. Tables are ready.');
}

migrate()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Migration failed:', err.message);
    pool.end();
    process.exit(1);
  });
