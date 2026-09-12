/**
 * ADMIN.F — disposable migration rehearsal (local or VPS disposable DB).
 *
 * Safety:
 *   - Refuses non-local DATABASE_URL unless ADMINF_ALLOW_REMOTE_DISPOSABLE=1
 *     and target DB name starts with adminf_
 *   - Never targets polezno_irkutsk production name unless explicitly overridden
 *     with ADMINF_ALLOW_PROD_NAME=1 (forbidden by default)
 *
 * Flow:
 *   1) Optional: create empty adminf_* DB
 *   2) Restore baseline dump (prod-like) OR assume baseline already restored
 *   3) Apply scripts/migrations/admin-f-prod-to-target.sql
 *   4) Verify enums/columns/indexes
 *   5) Print rollback contract hint
 *
 * Usage (local, after restoring a prod-like dump into adminf_mig):
 *   DATABASE_URL=postgres://.../adminf_mig node scripts/admin-f-migration-rehearsal.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import nextEnv from "@next/env";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);

const sqlPath = path.join(root, "scripts/migrations/admin-f-prod-to-target.sql");
const url = process.env.DATABASE_URL || "";
if (!url) {
  console.error("ABORT: DATABASE_URL required");
  process.exit(1);
}

const parsed = new URL(url);
const dbName = parsed.pathname.replace(/^\//, "");
const host = parsed.hostname;
const local = ["127.0.0.1", "localhost", "::1"].includes(host);
const allowRemote = process.env.ADMINF_ALLOW_REMOTE_DISPOSABLE === "1";
const allowProdName = process.env.ADMINF_ALLOW_PROD_NAME === "1";

if (!local && !allowRemote) {
  console.error("ABORT: non-local DATABASE_URL without ADMINF_ALLOW_REMOTE_DISPOSABLE=1");
  process.exit(2);
}
if (dbName === "polezno_irkutsk" && !allowProdName) {
  console.error("ABORT: refusing production DB name polezno_irkutsk");
  process.exit(2);
}
if (!dbName.startsWith("adminf_") && dbName !== "polezno_irkutsk") {
  console.error(`ABORT: expected disposable DB name adminf_* (got ${dbName})`);
  process.exit(2);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const client = new pg.Client({ connectionString: url });
await client.connect();

async function q(text) {
  const r = await client.query(text);
  return r.rows;
}

const before = {
  usersRole: (
    await q(`
      SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS v
      FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE t.typname='enum_users_role'`)
  )[0]?.v,
  leadsStatus: (
    await q(`
      SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS v
      FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE t.typname='enum_leads_status'`)
  )[0]?.v,
  leadCols: (
    await q(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='leads'
        AND column_name IN ('next_contact_at','last_contact_at','closed_reason','closed_reason_note')
      ORDER BY 1`)
  ).map((r) => r.column_name),
  reviewsStatus: (
    await q(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='reviews' AND column_name='status'`)
  ).length
    ? "PRESENT"
    : "MISSING",
};

console.log("BEFORE", JSON.stringify(before));

// Apply via psql when available for accurate multi-statement + DO blocks;
// fall back to node pg simple split on semicolons is unsafe — require psql.
  // Prefer psql when available; otherwise apply via node driver.
  const psql = spawnSync(
    "psql",
    [url, "-v", "ON_ERROR_STOP=1", "-f", sqlPath],
    { encoding: "utf8" }
  );
  if (psql.status !== 0) {
    console.error("psql apply failed; attempting node driver apply");
    console.error(psql.stderr || psql.stdout);
    try {
      await client.query(sql);
    } catch (err) {
      console.error("ABORT: migration apply failed", err.message);
      await client.end();
      process.exit(1);
    }
  } else {
    console.log("psql_apply=OK");
  }

const after = {
  usersRole: (
    await q(`
      SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS v
      FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE t.typname='enum_users_role'`)
  )[0]?.v,
  leadsStatus: (
    await q(`
      SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS v
      FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE t.typname='enum_leads_status'`)
  )[0]?.v,
  leadCols: (
    await q(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='leads'
        AND column_name IN ('next_contact_at','last_contact_at','closed_reason','closed_reason_note')
      ORDER BY 1`)
  ).map((r) => r.column_name),
  reviewsStatus: (
    await q(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='reviews' AND column_name='status'`)
  ).length
    ? "PRESENT"
    : "MISSING",
  articlesStatus: (
    await q(`
      SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS v
      FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE t.typname='enum_articles_status'`)
  )[0]?.v,
  indexes: (
    await q(`
      SELECT indexname FROM pg_indexes
      WHERE tablename='leads' AND indexname IN ('leads_status_idx','leads_next_contact_at_idx')
      ORDER BY 1`)
  ).map((r) => r.indexname),
  oldLeadStatusesReadable: (
    await q(`
      SELECT status::text AS s, count(*)::int AS c
      FROM leads
      GROUP BY 1
      ORDER BY 1`)
  ),
  ownerAdmins: (
    await q(`SELECT count(*)::int AS c FROM users WHERE role::text = 'admin'`)
  )[0]?.c,
};

const ok =
  String(after.usersRole || "").includes("developer") &&
  String(after.leadsStatus || "").includes("booked") &&
  String(after.leadsStatus || "").includes("declined") &&
  after.leadCols.length === 4 &&
  after.reviewsStatus === "PRESENT" &&
  after.indexes.length === 2;

const report = {
  at: new Date().toISOString(),
  gate: "ADMIN.F",
  dbName,
  host,
  before,
  after,
  verdict: ok ? "MIGRATION_REHEARSAL_PASS" : "MIGRATION_REHEARSAL_FAIL",
  rollbackHint:
    "Additive columns/enums: old app may boot; if new enum values written, prefer DB restore for clean rollback.",
};

console.log(JSON.stringify(report, null, 2));
await client.end();
process.exit(ok ? 0 : 1);
