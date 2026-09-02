#!/usr/bin/env node
/**
 * Writes durable release identity to .next/release-identity.json after a successful build.
 * Atomic write via temp file + rename. No secrets or paths in output.
 */
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RELEASE_IDENTITY_SCHEMA_VERSION = 1;
export const RELEASE_IDENTITY_PROJECT = "irkportal";
export const RELEASE_IDENTITY_MAX_BYTES = 4096;
export const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;

const ISO8601_UTC =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

const ALLOWED_KEYS = new Set([
  "schemaVersion",
  "project",
  "commitSha",
  "buildTimestamp",
  "worktreeDirty",
]);

export function isValidCommitSha(value) {
  return typeof value === "string" && COMMIT_SHA_PATTERN.test(value);
}

export function isValidBuildTimestamp(value) {
  if (typeof value !== "string" || !ISO8601_UTC.test(value)) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms);
}

export function validateReleaseIdentityArtifact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const keys = Object.keys(input);
  if (keys.some((key) => !ALLOWED_KEYS.has(key))) return null;
  if (input.schemaVersion !== RELEASE_IDENTITY_SCHEMA_VERSION) return null;
  if (input.project !== RELEASE_IDENTITY_PROJECT) return null;
  if (!isValidCommitSha(input.commitSha)) return null;
  if (!isValidBuildTimestamp(input.buildTimestamp)) return null;
  if (typeof input.worktreeDirty !== "boolean") return null;
  return {
    schemaVersion: RELEASE_IDENTITY_SCHEMA_VERSION,
    project: RELEASE_IDENTITY_PROJECT,
    commitSha: input.commitSha,
    buildTimestamp: input.buildTimestamp,
    worktreeDirty: input.worktreeDirty,
  };
}

export function detectWorktreeDirty(root) {
  const result = spawnSync(
    "git",
    ["-c", `safe.directory=${root}`, "status", "--porcelain", "--untracked-files=no"],
    { cwd: root, encoding: "utf8" }
  );
  if (result.status !== 0) {
    throw new Error("Unable to determine git worktree state for release identity.");
  }
  return result.stdout.trim().length > 0;
}

export function resolveReleaseIdentityPath(root) {
  return path.join(root, ".next", "release-identity.json");
}

export function writeReleaseIdentityArtifact({
  root,
  commitSha,
  buildTimestamp,
  worktreeDirty,
}) {
  if (!isValidCommitSha(commitSha)) {
    throw new Error("Invalid commit SHA for release identity artifact.");
  }
  if (!isValidBuildTimestamp(buildTimestamp)) {
    throw new Error("Invalid build timestamp for release identity artifact.");
  }
  if (typeof worktreeDirty !== "boolean") {
    throw new Error("worktreeDirty must be a boolean.");
  }

  const payload = {
    schemaVersion: RELEASE_IDENTITY_SCHEMA_VERSION,
    project: RELEASE_IDENTITY_PROJECT,
    commitSha,
    buildTimestamp,
    worktreeDirty,
  };

  const serialized = `${JSON.stringify(payload)}\n`;
  if (Buffer.byteLength(serialized, "utf8") > RELEASE_IDENTITY_MAX_BYTES) {
    throw new Error("Release identity artifact exceeds size limit.");
  }

  const nextDir = path.join(root, ".next");
  mkdirSync(nextDir, { recursive: true });
  const target = resolveReleaseIdentityPath(root);
  const temp = path.join(nextDir, `.release-identity.${process.pid}.tmp`);
  writeFileSync(temp, serialized, "utf8");
  renameSync(temp, target);
  return payload;
}

export function writeReleaseIdentityFromBuild({
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  commitSha,
  buildTimestamp,
  worktreeDirty = detectWorktreeDirty(root),
} = {}) {
  if (!commitSha) {
    const sha = spawnSync(
      "git",
      ["-c", `safe.directory=${root}`, "rev-parse", "HEAD"],
      { cwd: root, encoding: "utf8" }
    );
    if (sha.status !== 0 || !sha.stdout.trim()) {
      throw new Error("Unable to resolve git HEAD for release identity artifact.");
    }
    commitSha = sha.stdout.trim();
  }
  if (!buildTimestamp) {
    throw new Error("buildTimestamp is required for release identity artifact.");
  }
  return writeReleaseIdentityArtifact({
    root,
    commitSha,
    buildTimestamp,
    worktreeDirty,
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(process.cwd());
  const commitSha = process.env.GIT_COMMIT_SHA?.trim();
  const buildTimestamp = process.env.BUILD_TIMESTAMP?.trim();
  if (!commitSha || !buildTimestamp) {
    console.error("GIT_COMMIT_SHA and BUILD_TIMESTAMP are required.");
    process.exit(1);
  }
  writeReleaseIdentityFromBuild({ root, commitSha, buildTimestamp });
  console.log("✓ release-identity.json written");
}
