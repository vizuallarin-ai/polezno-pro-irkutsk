/**
 * ADMIN.E — on-host backup health (+ optional offsite when configured).
 *
 * Reports:
 *   local.db    — polezno_*.dump / source_*.dump
 *   local.media — polezno_media_*.tar.gz
 *   offsite     — contract readiness / LIVE verify when OFFSITE_MODE set
 *
 * Exit codes:
 *   0 = local layers OK and offsite verified (when configured)
 *   2 = local layers OK; offsite NOT LIVE / deferred (ADMIN.F)
 *   1 = failure (missing/empty/stale required local artifact, or offsite verify fail)
 *
 * REQUIRE_MEDIA_BACKUP=1 makes missing/stale media a hard failure (production cron).
 * Without it, media status is reported but does not fail the check (dev/CI).
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { BACKUP_POLICY, backupAgeSeverity } from "../lib/runtime-lifecycle.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function newestMatching(dirs, re) {
  const found = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!re.test(f)) continue;
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      if (st.size < 1) continue;
      found.push({ file: p, size: st.size, mtimeMs: st.mtimeMs });
    }
  }
  found.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return found[0] || null;
}

function layerReport(latest) {
  if (!latest || latest.size < 1) {
    return { status: "MISSING_OR_EMPTY" };
  }
  const ageHours = (Date.now() - latest.mtimeMs) / 3600000;
  return {
    status: backupAgeSeverity(ageHours),
    file: path.basename(latest.file),
    size: latest.size,
    ageHours: Number(ageHours.toFixed(2)),
    mtime: new Date(latest.mtimeMs).toISOString(),
  };
}

const dirs = [
  process.env.BACKUP_DIR,
  process.env.OUT_DIR,
  path.join(root, ".tmp-admin-e-backup"),
  path.join(root, ".tmp-admin-e1-restore"),
  "/var/backups/polezno",
].filter(Boolean);

const requireMedia = ["1", "true", "yes"].includes(
  String(process.env.REQUIRE_MEDIA_BACKUP || "").toLowerCase(),
);

const latestDb = newestMatching(dirs, /^(polezno_|source_).+\.dump$/i);
const latestMedia = newestMatching(dirs, /^polezno_media_.+\.tar\.gz$/i);

const report = {
  at: new Date().toISOString(),
  gate: "ADMIN.E",
  policy: BACKUP_POLICY,
  requireMediaBackup: requireMedia,
  local: {
    db: layerReport(latestDb),
    media: layerReport(latestMedia),
  },
  offsite: {
    configured: false,
    contract: "READY",
    live: "DEFERRED_TO_ADMIN_F",
    status: "NOT_LIVE",
  },
};

function localLayerFailed(layer) {
  return !layer || layer.status === "MISSING_OR_EMPTY" || layer.status === "CRITICAL";
}

if (localLayerFailed(report.local.db)) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

if (requireMedia && localLayerFailed(report.local.media)) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

const mode = process.env.OFFSITE_MODE || "";
if (!mode) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}

report.offsite.configured = true;
report.offsite.mode = mode;
report.offsite.live = "CONFIGURED";

if (mode === "s3") {
  const bucket = process.env.OFFSITE_S3_BUCKET;
  if (!bucket) {
    report.offsite.status = "MISCONFIGURED";
    report.offsite.live = "MISCONFIGURED";
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
    report.offsite.live = "VERIFY_FAILED";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  const lines = (r.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  report.offsite.status = lines.length ? "OBJECTS_PRESENT" : "EMPTY_PREFIX";
  report.offsite.objectCount = lines.length;
  report.offsite.sampleBasenames = lines.slice(-3).map((line) => {
    const parts = line.trim().split(/\s+/);
    return path.basename(parts[parts.length - 1] || "");
  });
  report.offsite.live = lines.length ? "LIVE" : "EMPTY";
  console.log(JSON.stringify(report, null, 2));
  process.exit(lines.length ? 0 : 1);
}

report.offsite.status = "MODE_UNSUPPORTED_IN_HEALTH_CHECK";
console.log(JSON.stringify(report, null, 2));
process.exit(2);
