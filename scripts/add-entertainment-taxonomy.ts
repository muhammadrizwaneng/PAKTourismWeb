/**
 * add-entertainment-taxonomy.ts
 * Upserts the "Entertainment & Fun" taxonomy into local SQLite and Turso.
 * Run: ts-node --compiler-options '{"module":"CommonJS"}' scripts/add-entertainment-taxonomy.ts
 */

import * as fs from 'fs';
import * as path from 'path';

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

import { PrismaClient } from '@prisma/client';
import { createTursoPrismaClient } from '../src/lib/turso-prisma';

const TAXONOMY = { id: 9, name: 'Entertainment & Fun', type: 'attraction' };

async function main() {
  // ── Local DB ──────────────────────────────────────────────────────────────
  const local = new PrismaClient({
    datasources: { db: { url: `file:${__dirname}/../prisma/dev.db` } },
  });

  await local.taxonomy.upsert({
    where: { id: TAXONOMY.id },
    update: { name: TAXONOMY.name, type: TAXONOMY.type },
    create: TAXONOMY,
  });
  console.log('✓ Local DB: upserted "Entertainment & Fun" taxonomy (id=9)');
  await local.$disconnect();

  // ── Turso DB ──────────────────────────────────────────────────────────────
  const turso = createTursoPrismaClient();

  await turso.taxonomy.upsert({
    where: { id: TAXONOMY.id },
    update: { name: TAXONOMY.name, type: TAXONOMY.type },
    create: TAXONOMY,
  });
  console.log('✓ Turso DB: upserted "Entertainment & Fun" taxonomy (id=9)');
  await turso.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
