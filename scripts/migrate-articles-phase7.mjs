/**
 * Phase 7: add articles columns and category enum values on production PostgreSQL.
 * Run: npx tsx scripts/migrate-articles-phase7.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

nextEnv.loadEnvConfig(root);

function loadEnvFile(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");
loadEnvFile(".env.production");

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const CATEGORY_VALUES = [
  "what-to-see",
  "where-to-walk",
  "streets",
  "winter",
  "locals",
  "business",
];

const statements = [
  `DO $$ BEGIN
    CREATE TYPE enum_articles_material_type AS ENUM ('article', 'history', 'place', 'guide');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS material_type enum_articles_material_type DEFAULT 'article';`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_url varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_name varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS source varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS photo_credit varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS historical_period varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS year numeric;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS street varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS place varchar;`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS district varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_material_type enum_articles_material_type;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_video_url varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_author_name varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_source varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_photo_credit varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_historical_period varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_year numeric;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_street varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_place varchar;`,
  `ALTER TABLE _articles_v ADD COLUMN IF NOT EXISTS version_district varchar;`,
  ...CATEGORY_VALUES.map(
    (value) =>
      `ALTER TYPE enum_articles_category ADD VALUE IF NOT EXISTS '${value}';`
  ),
];

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  console.log("Migrating articles schema (Phase 7)...");

  for (const sql of statements) {
    try {
      await client.query(sql);
      console.log("OK:", sql.split("\n")[0].slice(0, 80));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists")) {
        console.log("SKIP:", message);
        continue;
      }
      throw err;
    }
  }

  console.log("ARTICLES_PHASE7_MIGRATION_OK");
} finally {
  await client.end();
}
