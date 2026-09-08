#!/usr/bin/env node
/**
 * LEGACY in-place deploy — BLOCKED by default (RELEASE.1).
 *
 * Historical path built inside /var/www/polezno and ran `pm2 restart`.
 * That mutates a live working tree, can run db:push, and is not the
 * immutable release model.
 *
 * Canonical path:
 *   npm run deploy:immutable          # dry-run
 *   node scripts/immutable-release-deploy.mjs --execute --expected-sha <40hex> --backup-id <id>
 *
 * Emergency legacy only (owner-approved):
 *   ALLOW_LEGACY_INPLACE_DEPLOY=1 node scripts/deploy-prod.mjs --confirm-legacy-inplace
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeReleaseIdentityFromBuild } from "./write-release-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));

const allowed =
  process.env.ALLOW_LEGACY_INPLACE_DEPLOY === "1" &&
  args.has("--confirm-legacy-inplace");

if (!allowed) {
  console.error(`BLOCKED: scripts/deploy-prod.mjs is legacy in-place deploy.

Use immutable release instead:
  npm run deploy:immutable
  node scripts/immutable-release-deploy.mjs --execute --expected-sha <40hex> --backup-id <id>

Emergency override (owner only):
  ALLOW_LEGACY_INPLACE_DEPLOY=1 node scripts/deploy-prod.mjs --confirm-legacy-inplace
`);
  process.exit(2);
}

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env, cwd: root });
};

const releaseSha = execSync("git rev-parse HEAD", {
  cwd: root,
  encoding: "utf8",
}).trim();
const buildTimestamp = new Date().toISOString();
process.env.GIT_COMMIT_SHA = releaseSha;
process.env.BUILD_TIMESTAMP = buildTimestamp;

console.warn(
  "WARNING: legacy in-place deploy — prefers mutable checkout; prefer immutable releases."
);

try {
  run("git pull origin master");
  run("npm install --include=dev");
  run("npm run db:push");
  run("rm -rf .next");
  process.env.NODE_ENV = "production";
  process.env.NODE_OPTIONS =
    process.env.NODE_OPTIONS || "--max-old-space-size=1536";
  run("npm run build");
  writeReleaseIdentityFromBuild({
    root,
    commitSha: releaseSha,
    buildTimestamp,
  });
  run("pm2 restart polezno");
  console.log("\n✓ Legacy deploy complete");
} catch {
  console.error("\n✗ Deploy failed");
  process.exit(1);
}
