#!/usr/bin/env node
/**
 * Надёжный деплой на VPS (запускать на сервере в /var/www/polezno).
 * Локально: ssh root@90.156.170.182 "cd /var/www/polezno && npm run deploy:prod"
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeReleaseIdentityFromBuild } from "./write-release-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
};

const releaseSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const buildTimestamp = new Date().toISOString();
process.env.GIT_COMMIT_SHA = releaseSha;
process.env.BUILD_TIMESTAMP = buildTimestamp;

try {
  run("git pull origin master");
  run("npm install --include=dev");
  run("npm run db:push");
  run("rm -rf .next");
  process.env.NODE_ENV = "production";
  process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || "--max-old-space-size=1536";
  run("npm run build");
  writeReleaseIdentityFromBuild({
    root,
    commitSha: releaseSha,
    buildTimestamp,
  });
  run("pm2 restart polezno");
  console.log("\n✓ Deploy complete");
} catch {
  console.error("\n✗ Deploy failed");
  process.exit(1);
}
