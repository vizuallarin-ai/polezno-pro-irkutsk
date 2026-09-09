#!/usr/bin/env node
/**
 * Pre-switch / alternate-port smoke helper with EXIT trap cleanup.
 *
 * Usage (on VPS, from release dir):
 *   node scripts/preswitch-smoke-server.mjs --port 3912 --expect-sha <40hex> --smoke
 *
 * Starts `npm start` / next in child, runs health + optional route checks, always stops
 * and verifies the temp port is free (even on failure).
 */
import { spawn } from "node:child_process";
import http from "node:http";
import { parseHealthBody, sleep } from "../lib/runtime-lifecycle.mjs";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const port = Number(arg("--port", "3912"));
const expectSha = arg("--expect-sha", process.env.EXPECTED_GIT_SHA || "");
const doSmoke = process.argv.includes("--smoke");
const cwd = arg("--cwd", process.cwd());

let child = null;
let cleaned = false;

async function portFree() {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "127.0.0.1", port, method: "GET", path: "/api/health", timeout: 400 },
      (res) => {
        res.resume();
        resolve(false);
      }
    );
    req.on("error", () => resolve(true));
    req.on("timeout", () => {
      req.destroy();
      resolve(true);
    });
    req.end();
  });
}

async function fetchJson(path) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function cleanup(reason) {
  if (cleaned) return;
  cleaned = true;
  console.log(`[preswitch-smoke] cleanup (${reason})`);
  if (child && !child.killed) {
    try {
      child.kill("SIGTERM");
    } catch {
      /* */
    }
    await sleep(1500);
    if (child.exitCode === null) {
      try {
        child.kill("SIGKILL");
      } catch {
        /* */
      }
    }
  }
  for (let i = 0; i < 20; i++) {
    if (await portFree()) {
      console.log(`[preswitch-smoke] port :${port} free`);
      return;
    }
    await sleep(250);
  }
  console.error(`[preswitch-smoke] WARN: port :${port} still busy after cleanup`);
  process.exitCode = process.exitCode || 1;
}

process.on("exit", () => {
  /* sync path cannot await; best-effort */
  if (child && !child.killed) {
    try {
      child.kill("SIGKILL");
    } catch {
      /* */
    }
  }
});
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    cleanup(sig).finally(() => process.exit(1));
  });
}

async function main() {
  if (!(await portFree())) {
    throw new Error(`port ${port} already busy — ABORT`);
  }

  child = spawn("npm", ["start"], {
    cwd,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (d) => process.stdout.write(d));
  child.stderr.on("data", (d) => process.stderr.write(d));

  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const { status, body } = await fetchJson("/api/health");
      if (status === 200) {
        const parsed = parseHealthBody(body);
        if (!parsed.ok) throw new Error(parsed.reason);
        if (expectSha && parsed.commitSha !== expectSha) {
          throw new Error(`SHA mismatch want=${expectSha} got=${parsed.commitSha}`);
        }
        ready = true;
        console.log("[preswitch-smoke] health OK", parsed.commitSha);
        break;
      }
    } catch {
      /* retry */
    }
    await sleep(1000);
  }
  if (!ready) throw new Error("health timeout");

  if (doSmoke) {
    for (const p of ["/", "/explore", "/map", "/business", "/robots.txt", "/sitemap.xml"]) {
      const res = await fetch(`http://127.0.0.1:${port}${p}`);
      if (res.status !== 200) throw new Error(`${p} → ${res.status}`);
      console.log(`[preswitch-smoke] ${res.status} ${p}`);
    }
  }

  await cleanup("success");
  console.log("[preswitch-smoke] PASS");
}

main().catch(async (e) => {
  console.error("[preswitch-smoke] FAIL", e.message || e);
  process.exitCode = 1;
  await cleanup("failure");
});
