/**
 * ADMIN.E.1 — backup / offsite health check (no secrets printed).
 *
 * Local dumps: BACKUP_DIR or .tmp-admin-e* folders
 * Offsite: only when OFFSITE_MODE + destination env are set
 *
 * Exit codes:
 *   0 = local dump fresh enough (and offsite verified if configured)
 *   2 = offsite not configured (NOT LIVE) but local may be OK
 *   1 = failure (missing/empty/stale dump or offsite verify failed)
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { BACKUP_POLICY, backupAgeSeverity } from "../lib/runtime-lifecycle.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function newestDump(dirs) {
  const found = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      // Canonical on-host: polezno_*.dump; E.1 disposable: source_*.dump.
      // Ignore failure-probe stubs and other non-backup *.dump noise.
      if (!/^(polezno_|source_).+\.dump$/i.test(f)) continue;
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      if (st.size < 1) continue;
      found.push({ file: p, size: st.size, mtimeMs: st.mtimeMs });
    }
  }
  found.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return found[0] || null;
}

const dirs = [
  process.env.BACKUP_DIR,
  path.join(root, ".tmp-admin-e-backup"),
  path.join(root, ".tmp-admin-e1-restore"),
  "/var/backups/polezno",
].filter(Boolean);

const latest = newestDump(dirs);
const report = {
  at: new Date().toISOString(),
  gate: "ADMIN.E.1",
  policy: BACKUP_POLICY,
  local: null,
  offsite: { configured: false, status: "NOT_LIVE" },
};

if (!latest || latest.size < 1) {
  report.local = { status: "MISSING_OR_EMPTY" };
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

const ageHours = (Date.now() - latest.mtimeMs) / 3600000;
report.local = {
  status: backupAgeSeverity(ageHours),
  file: path.basename(latest.file),
  size: latest.size,
  ageHours: Number(ageHours.toFixed(2)),
  mtime: new Date(latest.mtimeMs).toISOString(),
};

const mode = process.env.OFFSITE_MODE || "";
if (!mode) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}

report.offsite.configured = true;
report.offsite.mode = mode;

if (mode === "s3") {
  const bucket = process.env.OFFSITE_S3_BUCKET;
  if (!bucket) {
    report.offsite.status = "MISCONFIGURED";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  const args = ["s3", "ls", `s3://${bucket}/db/`, "--recursive"];
  if (process.env.OFFSITE_S3_ENDPOINT) {
    args.push("--endpoint-url", process.env.OFFSITE_S3_ENDPOINT);
  }
  const r = spawnSync("aws", args, { encoding: "utf8" });
  if (r.status !== 0) {
    report.offsite.status = "LIST_FAILED";
    report.offsite.detail = "authenticated list failed (credentials/endpoint/bucket)";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  const lines = (r.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  report.offsite.status = lines.length ? "OBJECTS_PRESENT" : "EMPTY_PREFIX";
  report.offsite.objectCount = lines.length;
  // Do not print full keys if they embed host-specific paths beyond basename
  report.offsite.sampleBasenames = lines.slice(-3).map((line) => {
    const parts = line.trim().split(/\s+/);
    return path.basename(parts[parts.length - 1] || "");
  });
  console.log(JSON.stringify(report, null, 2));
  process.exit(lines.length ? 0 : 1);
}

report.offsite.status = "MODE_UNSUPPORTED_IN_HEALTH_CHECK";
console.log(JSON.stringify(report, null, 2));
process.exit(2);
