#!/usr/bin/env node
/**
 * Надёжный деплой на VPS (запускать на сервере в /var/www/polezno).
 * Локально: ssh root@90.156.170.182 "cd /var/www/polezno && npm run deploy:prod"
 */
import { execSync } from "node:child_process";

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
};

const releaseSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
process.env.GIT_COMMIT_SHA = releaseSha;
process.env.BUILD_TIMESTAMP = new Date().toISOString();

try {
  run("git pull origin master");
  run("npm install --include=dev");
  run("npm run db:push");
  run("rm -rf .next");
  process.env.NODE_ENV = "production";
  process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || "--max-old-space-size=1536";
  run("npm run build");
  run("pm2 restart polezno");
  console.log("\n✓ Deploy complete");
} catch {
  console.error("\n✗ Deploy failed");
  process.exit(1);
}
