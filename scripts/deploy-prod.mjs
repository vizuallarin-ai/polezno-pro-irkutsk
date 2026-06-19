#!/usr/bin/env node
/**
 * Надёжный деплой на VPS (запускать на сервере в /var/www/polezno).
 * Локально: ssh root@90.156.170.182 "cd /var/www/polezno && npm run deploy:prod"
 */
import { execSync } from "node:child_process";

const run = (cmd: string) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
};

try {
  run("git pull origin master");
  run("npm ci --include=dev");
  run("npm run db:push");
  run("rm -rf .next");
  process.env.NODE_ENV = "production";
  process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || "--max-old-space-size=1536";
  run("npm run build");
  run("pm2 restart polezno");
  console.log("\n✓ Deploy complete");
} catch (e) {
  console.error("\n✗ Deploy failed");
  process.exit(1);
}
