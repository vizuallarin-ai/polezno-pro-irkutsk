#!/usr/bin/env node
/**
 * Machine-friendly ops check. Exit 0 = healthy / warnings only; 2 = critical.
 * Wraps ops-status.mjs.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [path.join(__dirname, "ops-status.mjs"), "--json"], {
  encoding: "utf8",
  env: process.env,
});

if (r.error) {
  console.error(r.error);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(r.stdout || "{}");
} catch {
  console.error(r.stdout);
  console.error(r.stderr);
  process.exit(1);
}

const overall = report.overall || "UNHEALTHY";
console.log(`OVERALL=${overall}`);
if (report.liveSha) console.log(`LIVE_SHA=${report.liveSha}`);
if (report.signals?.disk) {
  console.log(
    `DISK=${report.signals.disk.severity} SAFE_NEXT_RELEASE=${report.signals.disk.safeNextRelease}`
  );
}
if (report.signals?.pm2?.npmWrapper) {
  console.log("PM2_NPM_WRAPPER=1");
}

if (overall === "UNHEALTHY") process.exit(2);
process.exit(0);
