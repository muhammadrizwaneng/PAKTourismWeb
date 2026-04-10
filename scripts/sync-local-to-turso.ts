/**
 * sync-local-to-turso.ts
 *
 * Reads ALL data from the local SQLite database and upserts it into
 * the Turso (LibSQL) database in dependency order.
 *
 * Usage:
 *   npm run db:sync:turso
 */

import * as fs from 'fs';
import * as path from 'path';

// Manually load .env (no dotenv dependency needed)
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

const local = new PrismaClient({
  datasources: { db: { url: `file:${__dirname}/../prisma/dev.db` } },
});

const turso = createTursoPrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────

const BATCH = 50; // rows per createMany call

function log(table: string, count: number) {
  console.log(`  ✓  ${table.padEnd(20)} ${count} rows`);
}

// ─── clear all Turso data (reverse dependency order) ──────────────────────

async function clearTurso() {
  console.log('\nClearing Turso tables...');
  // Use raw SQL to disable FK checks and truncate cleanly
  await turso.$executeRawUnsafe('PRAGMA foreign_keys = OFF');
  await turso.pointOfInterest.deleteMany();
  await turso.booking.deleteMany();
  await turso.review.deleteMany();
  await turso.$executeRawUnsafe('DELETE FROM "_PlanHotels"');
  await turso.plan.deleteMany();
  await turso.tourPackage.deleteMany();
  await turso.hotel.deleteMany();
  await turso.attraction.deleteMany();
  await turso.destination.deleteMany();
  await turso.taxonomy.deleteMany();
  await turso.tourGuide.deleteMany();
  await turso.banner.deleteMany();
  await turso.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  console.log('  ✓  All tables cleared\n');
}

// ─── sync functions (insert in batches) ────────────────────────────────────

async function syncTaxonomies() {
  const rows = await local.taxonomy.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.taxonomy.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('Taxonomy', rows.length);
}

async function syncDestinations() {
  const rows = await local.destination.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.destination.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('Destination', rows.length);
}

async function syncAttractions() {
  const rows = await local.attraction.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.attraction.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('Attraction', rows.length);
}

async function syncHotels() {
  const rows = await local.hotel.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.hotel.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('Hotel', rows.length);
}

async function syncTourPackages() {
  const rows = await local.tourPackage.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.tourPackage.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('TourPackage', rows.length);
}

async function syncTourGuides() {
  const rows = await local.tourGuide.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.tourGuide.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('TourGuide', rows.length);
}

async function syncPointsOfInterest() {
  const rows = await local.pointOfInterest.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.pointOfInterest.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('PointOfInterest', rows.length);
}

async function syncBanners() {
  const rows = await local.banner.findMany();
  for (let i = 0; i < rows.length; i += BATCH) {
    await turso.banner.createMany({ data: rows.slice(i, i + BATCH) });
  }
  log('Banner', rows.length);
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('\n❌  TURSO_DATABASE_URL is not set.');
    console.error('    Uncomment TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your .env file, then retry.\n');
    process.exit(1);
  }

  console.log('\n🔄  Starting local → Turso sync...');
  const start = Date.now();

  await clearTurso();

  console.log('Inserting data...');
  // Parent tables first (foreign key order)
  await syncTaxonomies();
  await syncDestinations();
  await syncAttractions();
  await syncHotels();
  await syncTourPackages();
  await syncPointsOfInterest();
  await syncTourGuides();
  await syncBanners();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅  Sync complete in ${elapsed}s\n`);
}

main()
  .catch((err) => {
    console.error('\n❌  Sync failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await turso.$disconnect();
  });
