/**
 * migrate-turso.ts
 *
 * Applies all pending migration SQL files to the Turso database.
 * Safe to re-run — uses IF NOT EXISTS and ignores "already exists" errors.
 *
 * Usage: npm run db:migrate:turso
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@libsql/client';

// Load .env manually
const envFile = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

if (!process.env.TURSO_DATABASE_URL) {
  console.error('❌  TURSO_DATABASE_URL is not set in .env');
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function applyStatement(sql: string, source: string) {
  const trimmed = sql.trim();
  if (!trimmed) return;
  try {
    await client.execute(trimmed);
  } catch (err: any) {
    const msg: string = err?.message ?? '';
    // Ignore benign errors
    if (
      msg.includes('already exists') ||
      msg.includes('duplicate column') ||
      msg.includes('no such column')  // for DROP COLUMN on column that doesn't exist
    ) {
      console.log(`  ⚠️  Skipped (already applied): ${trimmed.slice(0, 60)}...`);
    } else {
      console.error(`  ❌  Failed in ${source}:\n     ${trimmed.slice(0, 120)}`);
      console.error(`     Error: ${msg}`);
      throw err;
    }
  }
}

async function runMigrationFile(filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  const name = path.basename(path.dirname(filePath));
  console.log(`\n  Applying: ${name}`);

  // Split on semicolons, strip comment lines, filter empty
  const statements = sql
    .split(/;/)
    .map(s =>
      s
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await applyStatement(stmt + ';', name);
  }
}

async function main() {
  console.log('\n🔄  Applying Prisma migrations to Turso...\n');

  const migrationsDir = path.resolve(__dirname, '../prisma/migrations');
  const migrationDirs = fs
    .readdirSync(migrationsDir)
    .filter(d => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort(); // apply in chronological order

  for (const dir of migrationDirs) {
    const sqlFile = path.join(migrationsDir, dir, 'migration.sql');
    if (fs.existsSync(sqlFile)) {
      await runMigrationFile(sqlFile);
    }
  }

  console.log('\n✅  All migrations applied to Turso\n');
  client.close();
}

main().catch(err => {
  console.error('\n❌  Migration failed:', err);
  client.close();
  process.exit(1);
});
