#!/usr/bin/env node
/**
 * Verify release artifact identity matches an expected git SHA.
 * Does not build and does not mutate production.
 *
 * Usage:
 *   node scripts/release-verify-artifact.mjs
 *   node scripts/release-verify-artifact.mjs --expected-sha <40hex> --root .
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  COMMIT_SHA_PATTERN,
  validateReleaseIdentityArtifact,
} from "./write-release-identity.mjs";

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const out = { expectedSha: null, root: defaultRoot };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--expected-sha") out.expectedSha = argv[++i];
    else if (a.startsWith("--expected-sha=")) out.expectedSha = a.slice(16);
    else if (a === "--root") out.root = path.resolve(argv[++i]);
    else if (a.startsWith("--root=")) out.root = path.resolve(a.slice(7));
  }
  return out;
}

const cli = parseArgs(process.argv.slice(2));
const root = cli.root;
const head = spawnSync(
  "git",
  ["-c", `safe.directory=${root}`, "rev-parse", "HEAD"],
  { cwd: root, encoding: "utf8" }
).stdout.trim();

const expected = cli.expectedSha?.trim() || head;
if (!COMMIT_SHA_PATTERN.test(expected)) {
  console.error(`ABORT: invalid expected sha: ${expected}`);
  process.exit(1);
}

const identityPath = path.join(root, ".next", "release-identity.json");
const buildIdPath = path.join(root, ".next", "BUILD_ID");

if (!existsSync(identityPath)) {
  console.error("ABORT: missing .next/release-identity.json — run release build first");
  process.exit(1);
}
if (!existsSync(buildIdPath)) {
  console.error("ABORT: missing .next/BUILD_ID");
  process.exit(1);
}

const artifact = validateReleaseIdentityArtifact(
  JSON.parse(readFileSync(identityPath, "utf8"))
);
if (!artifact) {
  console.error("ABORT: invalid release-identity.json");
  process.exit(1);
}

const buildId = readFileSync(buildIdPath, "utf8").trim();
const ok = artifact.commitSha === expected;

console.log(
  JSON.stringify(
    {
      ok,
      expectedSha: expected,
      headSha: head,
      artifactSha: artifact.commitSha,
      buildTimestamp: artifact.buildTimestamp,
      worktreeDirty: artifact.worktreeDirty,
      BUILD_ID: buildId,
      identityPath,
    },
    null,
    2
  )
);

process.exit(ok ? 0 : 1);
