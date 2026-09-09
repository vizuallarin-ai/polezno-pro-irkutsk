/**
 * Pure helpers for PM2/Next runtime lifecycle, port ownership, and ops thresholds.
 * No secrets. Safe for unit/fixture tests and production ops scripts.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Production listen port for IrkPortal (nginx upstream). */
export const PRODUCTION_PORT = 3000;

/** Disk thresholds for 14G root with ~1.1G releases. Absolute free MB preferred. */
export const DISK_THRESHOLDS_MB = {
  /** Abort next release materialize */
  criticalFreeMb: 1500,
  /** Prefer cleanup / warning before next release */
  warningFreeMb: 3000,
  /** Approximate one release + build scratch */
  releaseNeedMb: 1500,
};

/** Backup freshness policy (pre-CONTENT.1 softer; tighten after CONTENT.1). */
export const BACKUP_POLICY = {
  warningAgeHours: 36,
  criticalAgeHours: 72,
  /** After CMS ingest becomes commercial: recommend 24h */
  postContentCriticalAgeHours: 24,
};

/** Restart-storm detection (delta, not absolute historical count). */
export const RESTART_STORM = {
  /** CRITICAL if this many new restarts within window */
  criticalDelta: 15,
  windowMs: 5 * 60 * 1000,
};

export const PM2_APP_NAME = "polezno";

/**
 * Canonical PM2 app shape for IrkPortal — direct Next binary (no npm → sh -c).
 * Used by ecosystem.config.cjs and contract tests.
 */
export function buildPoleznoPm2App(overrides = {}) {
  return {
    name: PM2_APP_NAME,
    cwd: "/var/www/polezno-current",
    // Direct Next CLI — PM2 owns the process that binds :3000.
    // Avoid: script "npm" + args "start" → sh -c → orphan next-server on restart.
    script: "node_modules/next/dist/bin/next",
    args: "start",
    interpreter: "node",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    restart_delay: 3000,
    exp_backoff_restart_delay: 1000,
    kill_timeout: 8000,
    listen_timeout: 15000,
    max_memory_restart: "900M",
    env: {
      NODE_ENV: "production",
      PORT: String(PRODUCTION_PORT),
    },
    env_production: {
      NODE_ENV: "production",
      PORT: String(PRODUCTION_PORT),
    },
    ...overrides,
  };
}

export function isNpmWrapperPm2App(app) {
  const script = String(app?.script || app?.pm_exec_path || "");
  const args = app?.args;
  const argStr = Array.isArray(args) ? args.join(" ") : String(args || "");
  const base = path.basename(script).toLowerCase();
  return base === "npm" || base === "npm.cmd" || /\bnpm\b/.test(script);
}

export function assertDirectNextPm2Contract(app) {
  const errors = [];
  if (isNpmWrapperPm2App(app)) {
    errors.push("PM2 must not use npm wrapper (orphan next-server risk)");
  }
  const script = String(app?.script || "");
  if (!script.includes("next")) {
    errors.push("PM2 script must invoke Next binary");
  }
  if (Number(app?.max_restarts ?? 0) < 1) {
    errors.push("max_restarts must be set to bound restart storms");
  }
  if (!app?.min_uptime) {
    errors.push("min_uptime must be set");
  }
  if (!app?.kill_timeout || Number(app.kill_timeout) < 3000) {
    errors.push("kill_timeout should be >= 3000ms");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Classify listener ownership for a port.
 * @param {{ pid?: number|null, cmdline?: string, cwd?: string }} listener
 * @param {{ expectedCwd?: string, expectedCmdSubstrings?: string[] }} opts
 */
export function classifyPortOwner(listener, opts = {}) {
  if (!listener || !listener.pid) {
    return { status: "free", action: "start_ok" };
  }
  const cmd = String(listener.cmdline || "");
  const cwd = String(listener.cwd || "");
  const expectedCwd = opts.expectedCwd || "/var/www/polezno-current";
  const needles = opts.expectedCmdSubstrings || [
    "next-server",
    "next start",
    "dist/bin/next",
  ];
  const looksLikeOurs = needles.some((n) => cmd.includes(n));
  const cwdOk =
    !cwd ||
    cwd === expectedCwd ||
    cwd.includes("polezno-current") ||
    cwd.includes("polezno-releases");

  if (looksLikeOurs && cwdOk) {
    return {
      status: "expected_runtime",
      action: "stop_then_start",
      pid: listener.pid,
    };
  }
  return {
    status: "foreign",
    action: "abort",
    pid: listener.pid,
    cmdline: cmd.slice(0, 200),
  };
}

export function diskSeverity(availMb) {
  const n = Number(availMb);
  if (!Number.isFinite(n)) return "CRITICAL";
  if (n < DISK_THRESHOLDS_MB.criticalFreeMb) return "CRITICAL";
  if (n < DISK_THRESHOLDS_MB.warningFreeMb) return "WARNING";
  return "PASS";
}

export function safeForNextRelease(availMb) {
  return Number(availMb) >= DISK_THRESHOLDS_MB.criticalFreeMb;
}

export function backupAgeSeverity(ageHours, { postContent = false } = {}) {
  const critical = postContent
    ? BACKUP_POLICY.postContentCriticalAgeHours
    : BACKUP_POLICY.criticalAgeHours;
  const warning = BACKUP_POLICY.warningAgeHours;
  const h = Number(ageHours);
  if (!Number.isFinite(h)) return "CRITICAL";
  if (h > critical) return "CRITICAL";
  if (h > warning) return "WARNING";
  return "PASS";
}

export function restartDeltaSeverity(delta, windowMs = RESTART_STORM.windowMs) {
  const d = Number(delta);
  if (!Number.isFinite(d) || d < 0) return "INFO";
  if (d >= RESTART_STORM.criticalDelta && windowMs <= RESTART_STORM.windowMs) {
    return "CRITICAL";
  }
  if (d >= 5) return "WARNING";
  return "PASS";
}

export function parseHealthBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "invalid body" };
  }
  const ok =
    body.status === "ok" &&
    body.app === "up" &&
    body.database === "up" &&
    typeof body.commitSha === "string" &&
    /^[0-9a-f]{40}$/.test(body.commitSha);
  return {
    ok,
    commitSha: body.commitSha,
    status: body.status,
    app: body.app,
    database: body.database,
    reason: ok ? undefined : "health contract failed",
  };
}

export function overallFromSeverities(severities) {
  const set = new Set(severities);
  if (set.has("CRITICAL")) return "UNHEALTHY";
  if (set.has("WARNING")) return "HEALTHY_WITH_WARNINGS";
  return "HEALTHY";
}

/** Wait helper for fixtures/scripts. */
export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Best-effort listen check via ss/lsof (Linux). Returns { listening, pid?, cmdline? }.
 */
export function probeListeningPort(port, { platform = process.platform } = {}) {
  if (platform === "win32") {
    const r = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `(Get-NetTCPConnection -LocalPort ${Number(port)} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess`,
      ],
      { encoding: "utf8" }
    );
    const pid = Number(String(r.stdout || "").trim());
    if (!Number.isFinite(pid) || pid <= 0) return { listening: false };
    return { listening: true, pid };
  }

  const ss = spawnSync("ss", ["-ltnp"], { encoding: "utf8" });
  const out = ss.stdout || "";
  const re = new RegExp(`:${Number(port)}\\b`);
  const line = out.split("\n").find((l) => re.test(l) && /LISTEN/.test(l));
  if (!line) return { listening: false };
  const m = line.match(/pid=(\d+)/);
  const pid = m ? Number(m[1]) : null;
  let cmdline = "";
  let cwd = "";
  if (pid) {
    try {
      cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ");
    } catch {
      /* ignore */
    }
    try {
      cwd = fs.readlinkSync(`/proc/${pid}/cwd`);
    } catch {
      /* ignore */
    }
  }
  return { listening: true, pid, cmdline, cwd, raw: line };
}

/**
 * Simulate npm-wrapper orphan: parent exits without killing child HTTP server.
 * Used only in fixtures.
 */
export function demonstrateNpmOrphanPattern() {
  return {
    chain: ["pm2", "npm", "sh -c next start", "next-server"],
    onPm2Restart:
      "SIGTERM → npm (PM2 PID) exits; sh/next-server may reparent to PID 1 and keep :3000",
    fix: "PM2 script = node_modules/next/dist/bin/next (direct); stop→port-free→start",
  };
}
