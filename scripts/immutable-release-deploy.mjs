#!/usr/bin/env node
/**
 * Gate 1H — Immutable release deploy state machine for IrkPortal.
 *
 * DEFAULT: dry-run / preflight ONLY (prints plan, exit 0).
 * REAL RUN requires explicit:
 *   --execute --expected-sha <40hex> --backup-id <id>
 *
 * Production switch mode: --switch-mode=symlink (default)
 * Cross-platform fixtures: --switch-mode=pointer
 *
 * Does NOT mutate production unless --execute is set and roots point at a
 * real DEPLOY_ROOT. Retention cleanup is NOT included.
 *
 * Execute path (owner-approved): this script.
 * Readiness preflight (no switch): scripts/deploy-prod-safe.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseCliArgs,
  runImmutableReleaseDeploy,
  buildDeployPlan,
  resolveDeployRoots,
} from "../lib/immutable-release.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`Immutable release deploy (Gate 1H)

Usage:
  node scripts/immutable-release-deploy.mjs
  node scripts/immutable-release-deploy.mjs --execute --expected-sha <40hex> --backup-id <id>

Flags:
  --execute                 Perform mutations (default: dry-run plan only)
  --expected-sha <sha>      Full 40-char hex commit (required with --execute)
  --backup-id <id>          Backup identifier (required with --execute)
  --switch-mode symlink|pointer   Default symlink (prod); pointer for fixtures
  --health-port <n>         Alternate localhost port for pre-switch health
  --project-root <path>     Repo root for package.json / git HEAD checks
  --help

Env (roots under DEPLOY_ROOT):
  DEPLOY_ROOT       default /var/www
  LEGACY_APP        default polezno
  RELEASES_DIR      default polezno-releases
  SHARED_DIR        default polezno-shared
  CURRENT_SYMLINK   default polezno-current
  DEPLOY_HEALTH_HOOK  optional path to .mjs health mock (tests)

Safety:
  - No broad rm -rf
  - Never mutates legacy checkout package-lock
  - Mutation ledger written without secrets
  - Retention cleanup NOT included
`);
}

async function main() {
  let cli;
  try {
    cli = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    console.error(String(err.message || err));
    process.exit(2);
  }

  if (cli.help) {
    printHelp();
    process.exit(0);
  }

  const projectRoot = cli.projectRoot
    ? path.resolve(cli.projectRoot)
    : defaultProjectRoot;

  if (!cli.execute) {
    const roots = resolveDeployRoots(process.env);
    const plan = buildDeployPlan({
      roots,
      expectedSha: cli.expectedSha,
      backupId: cli.backupId,
      switchMode: cli.switchMode,
      execute: false,
      projectRoot,
    });
    console.log("IrkPortal immutable release deploy — DRY-RUN / PREFLIGHT\n");
    console.log(JSON.stringify(plan, null, 2));
    console.log(
      "\nNo mutations performed. Pass --execute --expected-sha <40hex> --backup-id <id> for a real run."
    );
    process.exit(0);
  }

  try {
    const result = await runImmutableReleaseDeploy({
      execute: true,
      expectedSha: cli.expectedSha,
      backupId: cli.backupId,
      switchMode: cli.switchMode,
      healthPort: cli.healthPort,
      projectRoot,
    });
    console.log(`Deploy status: ${result.status}`);
    if (result.ledger?.writtenTo) {
      console.log(`Mutation ledger: ${result.ledger.writtenTo}`);
    }
    process.exit(result.exitCode ?? 0);
  } catch (err) {
    console.error(`DEPLOY FAILED: ${err.message || err}`);
    process.exit(1);
  }
}

main();
