#!/usr/bin/env node
/**
 * Read-only IrkPortal ops status (local + optional SSH facts via env).
 *
 * Usage:
 *   npm run ops:status
 *   SITE_URL=https://irkportal.ru npm run ops:status
 *   OPS_MODE=remote npm run ops:status   # expects Linux host tools when run on VPS
 *
 * Never prints secrets.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  PRODUCTION_PORT,
  parseHealthBody,
  diskSeverity,
  backupAgeSeverity,
  safeForNextRelease,
  overallFromSeverities,
  isNpmWrapperPm2App,
  restartDeltaSeverity,
  DISK_THRESHOLDS_MB,
  BACKUP_POLICY,
} from "../lib/runtime-lifecycle.mjs";

const SITE = (process.env.SITE_URL || "https://irkportal.ru").replace(/\/$/, "");
const LOCAL = (process.env.LOCAL_HEALTH_URL || `http://127.0.0.1:${PRODUCTION_PORT}/api/health`).replace(
  /\/$/,
  ""
);
const WANT_JSON = process.argv.includes("--json");
const ON_VPS =
  process.env.OPS_MODE === "remote" ||
  process.env.OPS_MODE === "vps" ||
  fs.existsSync("/var/www/polezno-current");

async function fetchHealth(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const body = await res.json().catch(() => null);
    const parsed = parseHealthBody(body);
    return {
      severity: res.status === 200 && parsed.ok ? "PASS" : "CRITICAL",
      http: res.status,
      ...parsed,
      url,
    };
  } catch (e) {
    return { severity: "CRITICAL", ok: false, reason: String(e.message || e), url };
  }
}

function readSymlinkSha() {
  try {
    const target = fs.readlinkSync("/var/www/polezno-current");
    return path.basename(target);
  } catch {
    try {
      const real = fs.realpathSync("/var/www/polezno-current");
      return path.basename(real);
    } catch {
      return null;
    }
  }
}

function pm2Facts() {
  if (!ON_VPS) return { severity: "INFO", detail: "skipped (not on VPS)" };
  const r = spawnSync("pm2", ["jlist"], { encoding: "utf8" });
  if (r.status !== 0) return { severity: "CRITICAL", detail: "pm2 jlist failed" };
  let list;
  try {
    list = JSON.parse(r.stdout || "[]");
  } catch {
    return { severity: "CRITICAL", detail: "pm2 json parse failed" };
  }
  const app = list.find((x) => x.name === "polezno");
  if (!app) return { severity: "CRITICAL", detail: "polezno app missing" };
  const env = app.pm2_env || {};
  const npmWrap = isNpmWrapperPm2App({
    script: env.pm_exec_path || env.script,
    args: env.args,
  });
  const status = env.status;
  let severity = status === "online" ? "PASS" : "CRITICAL";
  if (npmWrap && severity === "PASS") severity = "WARNING";
  return {
    severity,
    status,
    pid: app.pid,
    restarts: env.restart_time,
    cwd: env.pm_cwd,
    script: env.pm_exec_path || env.script,
    npmWrapper: npmWrap,
    memory: app.monit?.memory,
    detail: npmWrap
      ? "PM2 still uses npm wrapper — apply ecosystem via runtime-restart-safe on next OPS.2/deploy"
      : "direct runtime contract",
  };
}

function portFacts() {
  if (!ON_VPS) return { severity: "INFO", detail: "skipped (not on VPS)" };
  const ss = spawnSync("ss", ["-ltnp"], { encoding: "utf8" });
  const line = (ss.stdout || "")
    .split("\n")
    .find((l) => l.includes(`:${PRODUCTION_PORT}`) && /LISTEN/.test(l));
  if (!line) return { severity: "CRITICAL", detail: "nothing listening on :3000" };
  const m = line.match(/pid=(\d+)/);
  return { severity: "PASS", pid: m ? Number(m[1]) : null, line: line.slice(0, 180) };
}

function diskFacts() {
  if (!ON_VPS) return { severity: "INFO", detail: "skipped (not on VPS)" };
  const df = spawnSync("df", ["-Pm", "/"], { encoding: "utf8" });
  const row = (df.stdout || "").trim().split("\n")[1];
  if (!row) return { severity: "CRITICAL", detail: "df failed" };
  const parts = row.split(/\s+/);
  const availMb = Number(parts[3]);
  const usedPct = parts[4];
  const sev = diskSeverity(availMb);
  return {
    severity: sev,
    availMb,
    usedPct,
    safeNextRelease: safeForNextRelease(availMb),
    thresholds: DISK_THRESHOLDS_MB,
  };
}

function backupFacts() {
  const dir = process.env.BACKUP_DIR || "/var/backups/polezno";
  if (!fs.existsSync(dir)) {
    return { severity: ON_VPS ? "CRITICAL" : "INFO", detail: `no dir ${dir}` };
  }
  const dumps = fs
    .readdirSync(dir)
    .filter((f) => /^polezno_.*\.dump$/.test(f) || /^polezno_irkutsk.*\.dump$/.test(f))
    .map((f) => {
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      return { file: p, mtimeMs: st.mtimeMs, size: st.size };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (!dumps.length) return { severity: "CRITICAL", detail: "no dumps" };
  const latest = dumps[0];
  const ageHours = (Date.now() - latest.mtimeMs) / 3600000;
  const shaPath = `${latest.file}.sha256`;
  return {
    severity: backupAgeSeverity(ageHours),
    latest: latest.file,
    ageHours: Number(ageHours.toFixed(2)),
    size: latest.size,
    checksumPresent: fs.existsSync(shaPath),
    policy: BACKUP_POLICY,
    scheduler: "cron: NOT INSTALLED (see docs/OBS_1 — install scripts/cron/polezno-backup)",
  };
}

function nginxFacts() {
  if (!ON_VPS) return { severity: "INFO", detail: "skipped" };
  const active = spawnSync("systemctl", ["is-active", "nginx"], { encoding: "utf8" });
  const ok = String(active.stdout || "").trim() === "active";
  return { severity: ok ? "PASS" : "CRITICAL", active: String(active.stdout || "").trim() };
}

function rollbackFacts() {
  if (!ON_VPS) return { severity: "INFO", detail: "skipped" };
  const releases = "/var/www/polezno-releases";
  if (!fs.existsSync(releases)) return { severity: "CRITICAL", detail: "no releases dir" };
  const dirs = fs.readdirSync(releases).filter((d) => /^[0-9a-f]{40}$/.test(d));
  const current = readSymlinkSha();
  const others = dirs.filter((d) => d !== current);
  return {
    severity: others.length >= 1 ? "PASS" : "WARNING",
    current,
    releases: dirs,
    immediateRollbackCandidates: others.slice(0, 3),
  };
}

async function main() {
  const publicH = await fetchHealth(`${SITE}/api/health`);
  let localH = { severity: "INFO", detail: "skipped (not probing local from this host)" };
  if (ON_VPS || process.env.OPS_PROBE_LOCAL === "1") {
    localH = await fetchHealth(LOCAL.includes("/api/health") ? LOCAL : `${LOCAL}/api/health`);
  }

  const pm2 = pm2Facts();
  const port = portFacts();
  const disk = diskFacts();
  const backup = backupFacts();
  const nginx = nginxFacts();
  const rollback = rollbackFacts();

  // Restart rate: without baseline file we only INFO historical count
  const restartRate = {
    severity:
      typeof pm2.restarts === "number" && pm2.restarts > 100
        ? "WARNING"
        : "PASS",
    note: "Use restart delta file for rate; absolute historical count is not an automatic CRITICAL",
    restarts: pm2.restarts,
    deltaProbe: restartDeltaSeverity(0),
  };

  const signals = {
    applicationHealth: publicH,
    localHealth: localH,
    pm2,
    restartRate,
    port,
    nginx,
    disk,
    backup,
    rollback,
  };

  const overall = overallFromSeverities(
    Object.values(signals).map((s) => s.severity || "INFO")
  );

  const report = {
    project: "irkportal",
    overall,
    liveSha: publicH.commitSha || rollback.current || null,
    symlinkSha: rollback.current || null,
    signals,
  };

  if (WANT_JSON) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("IRKPORTAL OPS\n");
    const line = (name, s) => {
      const sev = s.severity || "?";
      const extra =
        s.detail ||
        s.reason ||
        (s.commitSha ? `sha=${s.commitSha}` : "") ||
        (s.availMb != null ? `free=${s.availMb}M safeRelease=${s.safeNextRelease}` : "") ||
        (s.latest ? `latest=${path.basename(s.latest)} ageH=${s.ageHours}` : "") ||
        (s.npmWrapper != null ? `npmWrapper=${s.npmWrapper} restarts=${s.restarts}` : "") ||
        "";
      console.log(`${name}: ${sev}${extra ? ` — ${extra}` : ""}`);
    };
    line("Application", publicH);
    line("Public health", publicH);
    line("Local health", localH);
    line("Database", {
      severity: publicH.database === "up" ? "PASS" : "CRITICAL",
      detail: `database=${publicH.database}`,
    });
    line("PM2", pm2);
    line("Restart rate", restartRate);
    line("Port 3000 owner", port);
    line("nginx", nginx);
    line("Disk", disk);
    line("Backup freshness", backup);
    line("Rollback target", rollback);
    console.log(`\nOVERALL: ${overall}`);
    if (pm2.npmWrapper) {
      console.log(
        "\nNOTE: Live PM2 still on npm wrapper. Code contract is direct-Next; apply via scripts/runtime-restart-safe.sh in OPS.2 / next authorized runtime window."
      );
    }
  }

  if (overall === "UNHEALTHY") process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
