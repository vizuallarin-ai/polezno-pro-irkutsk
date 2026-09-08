#!/usr/bin/env node
/**
 * RELEASE.1 — Release preflight (no production mutations).
 *
 * Aborts on critical failure. Does not deploy, switch symlink, or touch DB.
 *
 * Usage:
 *   npm run release:preflight
 *   node scripts/release-preflight.mjs --expected-sha <40hex>
 *   SITE_URL=https://irkportal.ru node scripts/release-preflight.mjs
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, statfsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COMMIT_SHA_PATTERN } from "./write-release-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GIT = ["git", "-c", `safe.directory=${root}`];

const MIN_FREE_BYTES = Number(process.env.RELEASE_MIN_FREE_BYTES || 1.5 * 1024 ** 3);

function parseArgs(argv) {
  const out = { expectedSha: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--expected-sha") out.expectedSha = argv[++i] || null;
    else if (a.startsWith("--expected-sha=")) out.expectedSha = a.slice("--expected-sha=".length);
  }
  return out;
}

function sh(args, opts = {}) {
  const r = spawnSync(args[0], args.slice(1), {
    cwd: root,
    encoding: "utf8",
    ...opts,
  });
  return r;
}

function git(args) {
  return sh([...GIT, ...args]);
}

function fail(msg) {
  console.error(`ABORT DEPLOY: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function warn(msg) {
  console.log(`○ ${msg}`);
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  if (cli.help) {
    console.log(`release-preflight — no mutations

  --expected-sha <40hex>   require HEAD == sha
  SITE_URL                 optional live health probe
`);
    process.exit(0);
  }

  console.log("IrkPortal RELEASE preflight (read-only)\n");

  if (!existsSync(path.join(root, ".git"))) fail("not a git repository");
  if (!existsSync(path.join(root, "package.json"))) fail("package.json missing");

  const pkg = JSON.parse(
    execSync("node -p \"JSON.stringify(require('./package.json'))\"", {
      cwd: root,
      encoding: "utf8",
    })
  );
  if (pkg.name !== "polezno-pro-irkutsk") fail(`unexpected package name: ${pkg.name}`);
  ok(`package ${pkg.name}`);

  const branch = git(["branch", "--show-current"]).stdout.trim();
  const head = git(["rev-parse", "HEAD"]).stdout.trim();
  if (!COMMIT_SHA_PATTERN.test(head)) fail(`invalid HEAD sha: ${head}`);
  ok(`branch=${branch || "(detached)"} HEAD=${head}`);

  const expected =
    cli.expectedSha?.trim() ||
    process.env.TARGET_GIT_SHA?.trim() ||
    process.env.EXPECTED_GIT_SHA?.trim() ||
    null;
  if (expected) {
    if (!COMMIT_SHA_PATTERN.test(expected)) fail(`--expected-sha must be 40-char hex`);
    if (expected !== head) fail(`HEAD ${head} != expected ${expected}`);
    ok(`SHA pinned: ${expected}`);
  } else {
    warn("no --expected-sha / TARGET_GIT_SHA — pin SHA before real deploy");
  }

  const porcelain = git([
    "status",
    "--porcelain",
    "--untracked-files=no",
  ]).stdout.trim();
  if (porcelain) fail(`tracked worktree dirty:\n${porcelain}`);
  ok("tracked worktree clean");

  const remote = git(["remote", "get-url", "origin"]);
  if (remote.status !== 0) fail("origin remote missing");
  ok(`origin=${remote.stdout.trim()}`);

  const lsRemote = git(["ls-remote", "--heads", "origin", branch || ""]);
  if (lsRemote.status !== 0) {
    warn("origin ls-remote failed (network?) — verify before deploy");
  } else {
    ok("origin reachable");
  }

  const requiredScripts = [
    "scripts/immutable-release-deploy.mjs",
    "scripts/build-release.mjs",
    "scripts/build-release-isolated.mjs",
    "scripts/backup-db.sh",
    "scripts/ops-release-retention.sh",
    "ecosystem.config.cjs",
  ];
  for (const rel of requiredScripts) {
    if (!existsSync(path.join(root, rel))) fail(`missing ${rel}`);
  }
  ok("canonical release scripts present");

  // Disk free (Node 18.15+ statfsSync). Fail closed if unavailable on critical hosts.
  try {
    const st = statfsSync(root);
    const free = Number(st.bavail) * Number(st.bsize);
    const freeGb = (free / 1024 ** 3).toFixed(2);
    if (free < MIN_FREE_BYTES) {
      fail(`disk free ${freeGb}G < minimum ${(MIN_FREE_BYTES / 1024 ** 3).toFixed(1)}G`);
    }
    ok(`disk free ≈ ${freeGb}G (threshold ${(MIN_FREE_BYTES / 1024 ** 3).toFixed(1)}G)`);
  } catch {
    warn("statfs unavailable — run df -h on deploy host before switch");
  }

  const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
  let liveSha = null;
  if (siteUrl) {
    try {
      const res = await fetch(`${siteUrl}/api/health`, { cache: "no-store" });
      const body = await res.json();
      liveSha = body.commitSha || null;
      if (!res.ok) fail(`live health HTTP ${res.status} database=${body.database ?? "?"}`);
      ok(
        `live health green project=${body.project} sha=${body.commitSha} db=${body.database ?? "n/a"}`
      );
    } catch (err) {
      fail(`live health unreachable: ${err.message || err}`);
    }
  } else {
    warn("SITE_URL not set — skipped live health / current SHA probe");
  }

  console.log("\nCURRENT / PREVIOUS / TARGET (operator must confirm on VPS):");
  console.log(`  TARGET:   ${expected || head}`);
  console.log(`  CURRENT:  ${liveSha || "NOT VERIFIED (set SITE_URL or read polezno-current on VPS)"}`);
  console.log(
    "  PREVIOUS: NOT VERIFIED here — resolve readlink -f /var/www/polezno-current and sibling release dirs"
  );

  console.log("\nPreflight PASS — no production mutations.");
  console.log("Deploy still requires explicit owner authorization + --execute flags.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
