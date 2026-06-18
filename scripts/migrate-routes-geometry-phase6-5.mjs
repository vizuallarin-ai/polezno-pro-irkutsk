/**
 * Phase 6.5: backfill route_geometry fields for existing routes.
 * Run: npm run db:migrate:routes-geometry
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

nextEnv.loadEnvConfig(root);

function loadEnvFile(relativePath: string) {
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

const statements = [
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_active_source varchar;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_status varchar;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_show_route_line boolean DEFAULT true;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_route_line_color varchar;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_manual_geometry jsonb;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_api_geometry jsonb;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_fallback_geometry jsonb;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_distance_meters numeric;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_duration_minutes_min numeric;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_duration_minutes_max numeric;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_provider varchar;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_provider_request_hash varchar;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_provider_raw_response jsonb;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_points_fingerprint varchar;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_geometry_updated_at timestamptz;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_geometry_reviewed_at timestamptz;`,
  `ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_geometry_last_error varchar;`,
];

async function main() {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  for (const sql of statements) {
    await client.query(sql);
    console.log("OK:", sql.split("\n")[0]);
  }

  await client.end();
  console.log("Phase 6.5 routes geometry migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
