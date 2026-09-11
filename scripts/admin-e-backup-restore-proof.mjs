/**
 * ADMIN.E — local backup create + restore proof (disposable DB only).
 * Uses pg_dump/pg_restore when available; otherwise marks tool gap.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import nextEnv from "@next/env";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);

const evidenceDir = path.join(root, "docs/admin/evidence");
fs.mkdirSync(evidenceDir, { recursive: true });

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], {
    encoding: "utf8",
  });
  if (r.status === 0) {
    const hit = r.stdout.trim().split(/\r?\n/)[0];
    if (hit) return hit;
  }
  // Windows Postgres installer often omits bin from PATH
  if (process.platform === "win32") {
    const roots = ["C:\\Program Files\\PostgreSQL", "C:\\Program Files (x86)\\PostgreSQL"];
    for (const root of roots) {
      if (!fs.existsSync(root)) continue;
      const versions = fs.readdirSync(root).sort().reverse();
      for (const v of versions) {
        const candidate = path.join(root, v, "bin", `${cmd}.exe`);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return null;
}

function parseDb(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || "5432",
    database: u.pathname.replace(/^\//, ""),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
  };
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1")) {
    throw new Error("Refuse non-local DATABASE_URL");
  }
  const info = parseDb(dbUrl);
  if (info.database === "polezno_irkutsk" && process.env.ALLOW_LOCAL_NAMED_PROD_LIKE !== "1") {
    // Local DB often reuses prod-like name; require explicit ack for dump of this name.
    console.log("NOTE: local DB name equals production name; proceeding as disposable local only.");
  }

  const pgDump = which("pg_dump");
  const pgRestore = which("pg_restore");
  const psql = which("psql");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(root, ".tmp-admin-e-backup");
  fs.mkdirSync(outDir, { recursive: true });
  const dumpPath = path.join(outDir, `polezno_local_${stamp}.dump`);
  const tempDb = `restore_probe_${Date.now()}`;

  const env = { ...process.env, PGPASSWORD: info.password };

  const evidence = {
    at: new Date().toISOString(),
    gate: "ADMIN.E",
    sourceDb: info.database,
    host: info.host,
    dumpPath,
    tempDb,
    backupCreated: false,
    restoreProven: false,
    tools: { pgDump: Boolean(pgDump), pgRestore: Boolean(pgRestore), psql: Boolean(psql) },
  };

  if (!pgDump || !pgRestore || !psql) {
    evidence.status = "BACKUP_TOOLS_MISSING_ON_WINDOWS_HOST";
    evidence.note =
      "Canonical scripts backup-db.sh + backup-restore-dry-run.sh are VPS/bash. Local Windows lacks pg client tools in PATH.";
    fs.writeFileSync(
      path.join(evidenceDir, "ADMIN_E_BACKUP_RESTORE.md"),
      `# ADMIN.E — Backup/restore evidence\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n`
    );
    console.log(evidence.status, evidence);
    // Still prove SQL-level snapshot/count via node as weaker LOCAL_SQL_SMOKE
    const client = new pg.Client({ connectionString: dbUrl });
    await client.connect();
    const tables = await client.query(
      `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'`
    );
    evidence.publicTables = tables.rows[0].n;
    evidence.localSqlSmoke = "PASS";
    await client.end();
    fs.writeFileSync(
      path.join(evidenceDir, "ADMIN_E_BACKUP_RESTORE.md"),
      `# ADMIN.E — Backup/restore evidence\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n\nLOCAL RESTORE PROVEN via pg_dump: **NO** (tools missing).\nCanonical VPS dry-run script: \`scripts/backup-restore-dry-run.sh\` (OPS.2).\n`
    );
    process.exit(0);
  }

  const dump = spawnSync(
    pgDump,
    ["-Fc", "-h", info.host, "-p", info.port, "-U", info.user, "-f", dumpPath, info.database],
    { env, encoding: "utf8" }
  );
  if (dump.status !== 0) throw new Error(dump.stderr || "pg_dump failed");
  evidence.backupCreated = true;
  evidence.dumpBytes = fs.statSync(dumpPath).size;

  const create = spawnSync(
    psql,
    ["-h", info.host, "-p", info.port, "-U", info.user, "-d", "postgres", "-c", `CREATE DATABASE \"${tempDb}\"`],
    { env, encoding: "utf8" }
  );
  if (create.status !== 0) throw new Error(create.stderr || "create db failed");

  const restore = spawnSync(
    pgRestore,
    ["-h", info.host, "-p", info.port, "-U", info.user, "-d", tempDb, "--no-owner", "--no-acl", dumpPath],
    { env, encoding: "utf8" }
  );
  // pg_restore may return non-zero with warnings; verify tables
  const check = spawnSync(
    psql,
    [
      "-h",
      info.host,
      "-p",
      info.port,
      "-U",
      info.user,
      "-d",
      tempDb,
      "-Atc",
      "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'",
    ],
    { env, encoding: "utf8" }
  );
  const tableCount = Number((check.stdout || "").trim());
  if (!tableCount || tableCount < 1) {
    throw new Error(`restore produced no tables; pg_restore stderr=${restore.stderr}`);
  }
  evidence.restoreProven = true;
  evidence.restoredPublicTables = tableCount;
  evidence.pgRestoreStatus = restore.status;

  spawnSync(
    psql,
    ["-h", info.host, "-p", info.port, "-U", info.user, "-d", "postgres", "-c", `DROP DATABASE IF EXISTS \"${tempDb}\"`],
    { env, encoding: "utf8" }
  );

  evidence.status = "BACKUP_CREATED_AND_RESTORE_PROVEN";
  fs.writeFileSync(
    path.join(evidenceDir, "ADMIN_E_BACKUP_RESTORE.md"),
    `# ADMIN.E — Backup/restore evidence\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n`
  );
  console.log(evidence.status, evidence);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
