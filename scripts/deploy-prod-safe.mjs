#!/usr/bin/env node
/**
 * Deploy READINESS preflight only — does NOT deploy and does NOT mutate production.
 *
 * Captures rollback metadata and package-lock drift patch locally or on VPS
 * before any future owner-approved deploy execute step.
 *
 * Usage (local or VPS, read-only checks + artifact capture):
 *   node scripts/deploy-prod-safe.mjs --preflight
 *
 * There is NO --execute mode in this script. Atomic release switching is NOT
 * implemented here; see docs/phase15-production-readiness-report.md.
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));

if (args.has("--execute")) {
  console.error("BLOCKED: --execute is not implemented. Preflight only.");
  process.exit(1);
}

const ROLLBACK_SHA = "3631094e14616c6f816bbd6308701e201ed69309";
const ROLLBACK_BUILD_ID = "zOvFS1L8wUwIeQ5wVB9ij";

function sh(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
}

function capturePackageLockDrift() {
  const diff = sh("git diff -- package-lock.json");
  if (!diff) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(root, ".deploy-artifacts");
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `package-lock.drift.${stamp}.patch`);
  writeFileSync(out, diff, "utf8");
  return { patch: out, stat: sh("git diff --stat -- package-lock.json") };
}

function writeRollbackManifest(targetSha) {
  const dir = path.join(root, ".deploy-artifacts");
  mkdirSync(dir, { recursive: true });
  const manifest = {
    createdAt: new Date().toISOString(),
    rollbackSha: ROLLBACK_SHA,
    rollbackBuildId: ROLLBACK_BUILD_ID,
    targetSha,
    packageLockDriftPolicy: "preserve — never git checkout -- package-lock.json on production",
    releaseSwitching: "NOT IMPLEMENTED — requires polezno-current symlink migration (see readiness report)",
  };
  const file = path.join(dir, "rollback-manifest.json");
  writeFileSync(file, JSON.stringify(manifest, null, 2));
  return file;
}

function main() {
  if (!existsSync(path.join(root, ".git"))) {
    console.error("BLOCKED: not a git repository");
    process.exit(1);
  }

  const targetSha = process.env.TARGET_GIT_SHA?.trim() || sh("git rev-parse HEAD");
  console.log("Irkportal deploy preflight (readiness artifacts only — no deploy)\n");
  console.log(`Target SHA: ${targetSha}`);
  console.log(`Rollback SHA: ${ROLLBACK_SHA}`);
  console.log(`Rollback BUILD_ID: ${ROLLBACK_BUILD_ID}`);

  const drift = capturePackageLockDrift();
  if (drift) {
    console.log(`package-lock drift preserved: ${drift.patch}`);
    console.log(drift.stat);
  } else {
    console.log("package-lock.json: no working-tree drift");
  }

  const manifest = writeRollbackManifest(targetSha);
  console.log(`Rollback manifest: ${manifest}`);

  console.log("\nLIMITATIONS:");
  console.log("- This script does NOT perform atomic release switching.");
  console.log("- deploy-prod.mjs still builds in-place — high risk until symlink migration.");
  console.log("- Do NOT run git checkout/restore on production package-lock.json drift.");
  console.log("\nPreflight complete — no production mutations.");
}

main();
