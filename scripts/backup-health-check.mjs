/**
 * ADMIN.E/F — on-host backup health (+ optional offsite when configured).
 *
 * Reports:
 *   local.db    — polezno_*.dump / source_*.dump
 *   local.media — polezno_media_*.tar.gz
 *   offsite.db / offsite.media — LIVE verify when OFFSITE_MODE=s3
 *
 * Exit codes:
 *   0 = local layers OK and offsite verified (when configured)
 *   2 = local layers OK; offsite NOT LIVE / deferred (ADMIN.F owner infra)
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

function listS3Prefix(bucket, prefix) {
  const args = ["s3", "ls", `s3://${bucket}/${prefix}`, "--recursive"];
  if (process.env.OFFSITE_S3_ENDPOINT) {
    args.push("--endpoint-url", process.env.OFFSITE_S3_ENDPOINT);
  }
  const r = spawnSync("aws", args, { encoding: "utf8" });
  if (r.status !== 0) {
    return {
      ok: false,
      status: "LIST_FAILED",
      detail: "authenticated list failed (credentials/endpoint/bucket)",
      objectCount: 0,
      sampleBasenames: [],
    };
  }
  const lines = (r.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  // aws s3 ls lines: DATE TIME SIZE KEY
  const nonempty = lines.filter((line) => {
    const parts = line.trim().split(/\s+/);
    const size = Number(parts[2]);
    return Number.isFinite(size) && size > 0;
  });
  return {
    ok: nonempty.length > 0,
    status: nonempty.length ? "OBJECTS_PRESENT" : "EMPTY_PREFIX",
    objectCount: nonempty.length,
    sampleBasenames: nonempty.slice(-3).map((line) => {
      const parts = line.trim().split(/\s+/);
      return path.basename(parts[parts.length - 1] || "");
    }),
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
  gate: "ADMIN.F",
  policy: BACKUP_POLICY,
  requireMediaBackup: requireMedia,
  local: {
    db: layerReport(latestDb),
    media: layerReport(latestMedia),
  },
  offsite: {
    configured: false,
    contract: "READY",
    live: "NOT_LIVE",
    status: "NOT_LIVE",
    db: { status: "NOT_LIVE" },
    media: { status: "NOT_LIVE" },
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
  report.offsite.live = "DEFERRED_OWNER_INFRA";
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}

report.offsite.configured = true;
report.offsite.mode = mode;

if (mode === "s3") {
  const bucket = process.env.OFFSITE_S3_BUCKET;
  if (!bucket) {
    report.offsite.status = "MISCONFIGURED";
    report.offsite.live = "MISCONFIGURED";
    report.offsite.db = { status: "MISCONFIGURED" };
    report.offsite.media = { status: "MISCONFIGURED" };
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const dbRemote = listS3Prefix(bucket, "db/");
  const mediaRemote = listS3Prefix(bucket, "media/");
  report.offsite.db = {
    status: dbRemote.ok ? "HEALTHY" : dbRemote.status,
    objectCount: dbRemote.objectCount,
    sampleBasenames: dbRemote.sampleBasenames,
    ...(dbRemote.detail ? { detail: dbRemote.detail } : {}),
  };
  report.offsite.media = {
    status: mediaRemote.ok ? "HEALTHY" : mediaRemote.status,
    objectCount: mediaRemote.objectCount,
    sampleBasenames: mediaRemote.sampleBasenames,
    ...(mediaRemote.detail ? { detail: mediaRemote.detail } : {}),
  };

  const bothOk = dbRemote.ok && mediaRemote.ok;
  if (dbRemote.status === "LIST_FAILED" || mediaRemote.status === "LIST_FAILED") {
    report.offsite.status = "VERIFY_FAILED";
    report.offsite.live = "VERIFY_FAILED";
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  report.offsite.status = bothOk ? "LIVE" : "INCOMPLETE";
  report.offsite.live = bothOk ? "LIVE" : "INCOMPLETE";
  console.log(JSON.stringify(report, null, 2));
  process.exit(bothOk ? 0 : 1);
}

report.offsite.status = "MODE_UNSUPPORTED_IN_HEALTH_CHECK";
report.offsite.db = { status: "UNSUPPORTED_MODE" };
report.offsite.media = { status: "UNSUPPORTED_MODE" };
console.log(JSON.stringify(report, null, 2));
process.exit(2);
