#!/usr/bin/env node
/**
 * Isolated release build — requires SSH-tunneled disposable PostgreSQL on VPS.
 * Never uses production DATABASE_URL or VPS credentials.
 */
import { execSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeReleaseIdentityFromBuild } from "./write-release-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GIT = ["git", "-c", `safe.directory=${root}`];

async function loadGuard() {
  const mod = await import(
    pathToFileURL(path.join(root, "lib/build-database-guard.ts")).href
  );
  return mod;
}

function loadOptionalLocalSecrets() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) return {};
  const text = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  const pick = (key) => {
    const m = text.match(new RegExp(`^${key}=(.+)$`, "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined;
  };
  return {
    REVALIDATE_SECRET: pick("REVALIDATE_SECRET"),
    NEXT_PUBLIC_SERVER_URL: pick("NEXT_PUBLIC_SERVER_URL") || "http://localhost:3000",
  };
}

function runBuild(buildEnv) {
  console.log("\n> npm run build");
  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: buildEnv,
  });
}

const disposableUrl = process.env.PHASE15_DISPOSABLE_DATABASE_URL?.trim();
if (!disposableUrl) {
  console.error("BUILD ENVIRONMENT BLOCKED: PHASE15_DISPOSABLE_DATABASE_URL is not set.");
  process.exit(1);
}

const guard = await loadGuard();
try {
  guard.assertDisposableDatabaseUrl(disposableUrl);
  await guard.verifyRuntimeDatabaseHandshake(disposableUrl);
  console.log("✓ Disposable database URL and runtime handshake verified");
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`BUILD ENVIRONMENT BLOCKED: ${message}`);
  process.exit(1);
}

const sha = spawnSync(GIT[0], [...GIT.slice(1), "rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).stdout.trim();
const buildTimestamp = new Date().toISOString();

const optionalSecrets = loadOptionalLocalSecrets();
const payloadSecret =
  process.env.PHASE15_PAYLOAD_SECRET?.trim() ||
  randomBytes(32).toString("hex");

const buildEnv = {
  ...process.env,
  ...optionalSecrets,
  PAYLOAD_SECRET: payloadSecret,
  DATABASE_URL: disposableUrl,
  GIT_COMMIT_SHA: sha || "unknown",
  BUILD_TIMESTAMP: buildTimestamp,
  NODE_ENV: "production",
  ALLOW_DEMO_FALLBACK: "false",
  PHASE15_DB_POOL_MAX: "4",
  NEXT_PRIVATE_BUILD_WORKER_COUNT: "1",
};

delete buildEnv.PHASE15_DISPOSABLE_DATABASE_URL;
delete buildEnv.PHASE15_PAYLOAD_SECRET;

try {
  console.log("\n> npm run db:push (disposable DB schema only)");
  execSync("npm run db:push", {
    cwd: root,
    stdio: "inherit",
    env: buildEnv,
  });
  runBuild(buildEnv);
  writeReleaseIdentityFromBuild({
    root,
    commitSha: buildEnv.GIT_COMMIT_SHA,
    buildTimestamp,
  });
  console.log("\n✓ Isolated release build complete");
  console.log(`  GIT_COMMIT_SHA=${buildEnv.GIT_COMMIT_SHA}`);
  console.log(`  BUILD_TIMESTAMP=${buildTimestamp}`);
} catch {
  console.error("\n✗ Isolated release build failed");
  process.exit(1);
} finally {
  delete process.env.DATABASE_URL;
  delete process.env.PAYLOAD_SECRET;
}
