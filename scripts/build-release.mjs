#!/usr/bin/env node
/**
 * Production-like build with release identity env (local / CI / VPS).
 * Uses DATABASE_URL from .env.local only — never production DB.
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeReleaseIdentityFromBuild } from "./write-release-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  const match = text.match(/^DATABASE_URL=(.+)$/m);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function run(cmd, env = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

const databaseUrl = loadEnvLocal();
if (!databaseUrl) {
  console.error(
    "BUILD ENVIRONMENT BLOCKED: .env.local must define DATABASE_URL for isolated Payload/SSG build."
  );
  process.exit(1);
}

const sha = spawnSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).stdout.trim();

const buildTimestamp = new Date().toISOString();
const buildEnv = {
  DATABASE_URL: databaseUrl,
  GIT_COMMIT_SHA: sha || "unknown",
  BUILD_TIMESTAMP: buildTimestamp,
  NODE_ENV: "production",
};

try {
  run("npm run build", buildEnv);
  writeReleaseIdentityFromBuild({
    root,
    commitSha: buildEnv.GIT_COMMIT_SHA,
    buildTimestamp,
  });
  console.log("\n✓ Release build complete");
  console.log(`  GIT_COMMIT_SHA=${buildEnv.GIT_COMMIT_SHA}`);
  console.log(`  BUILD_TIMESTAMP=${buildTimestamp}`);
} catch {
  console.error(
    "\n✗ Release build failed — ensure local PostgreSQL is running and reachable from DATABASE_URL."
  );
  process.exit(1);
}
