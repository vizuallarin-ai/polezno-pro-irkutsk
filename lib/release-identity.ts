/** Build/runtime release identity for irkportal.ru (no secrets, no paths). */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const RELEASE_PROJECT_ID = "irkportal" as const;
export const RELEASE_IDENTITY_ARTIFACT_REL = ".next/release-identity.json";
export const RELEASE_IDENTITY_MAX_BYTES = 4096;
export const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;

const ISO8601_UTC =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

const ALLOWED_ARTIFACT_KEYS = new Set([
  "schemaVersion",
  "project",
  "commitSha",
  "buildTimestamp",
  "worktreeDirty",
]);

export type IdentitySource = "artifact" | "environment" | "incomplete";

export type ReleaseIdentityArtifact = {
  schemaVersion: 1;
  project: typeof RELEASE_PROJECT_ID;
  commitSha: string;
  buildTimestamp: string;
  worktreeDirty: boolean;
};

export type ReleaseIdentity = {
  project: typeof RELEASE_PROJECT_ID;
  status: "ok";
  commitSha: string;
  buildTimestamp: string;
  identitySource: IdentitySource;
  identityComplete: boolean;
  worktreeDirty: boolean;
};

export function isValidCommitSha(value: string): boolean {
  return COMMIT_SHA_PATTERN.test(value);
}

export function isValidBuildTimestamp(value: string): boolean {
  if (!ISO8601_UTC.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

export function validateReleaseIdentityArtifact(
  input: unknown
): ReleaseIdentityArtifact | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.some((key) => !ALLOWED_ARTIFACT_KEYS.has(key))) return null;
  if (record.schemaVersion !== 1) return null;
  if (record.project !== RELEASE_PROJECT_ID) return null;
  if (typeof record.commitSha !== "string" || !isValidCommitSha(record.commitSha)) {
    return null;
  }
  if (
    typeof record.buildTimestamp !== "string" ||
    !isValidBuildTimestamp(record.buildTimestamp)
  ) {
    return null;
  }
  if (typeof record.worktreeDirty !== "boolean") return null;
  return {
    schemaVersion: 1,
    project: RELEASE_PROJECT_ID,
    commitSha: record.commitSha,
    buildTimestamp: record.buildTimestamp,
    worktreeDirty: record.worktreeDirty,
  };
}

export function readReleaseIdentityArtifact(
  root: string = process.cwd()
): ReleaseIdentityArtifact | null {
  const artifactPath = path.join(root, RELEASE_IDENTITY_ARTIFACT_REL);
  if (!existsSync(artifactPath)) return null;
  try {
    const raw = readFileSync(artifactPath, "utf8");
    if (Buffer.byteLength(raw, "utf8") > RELEASE_IDENTITY_MAX_BYTES) return null;
    return validateReleaseIdentityArtifact(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function isProductionLikeRuntime(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  return env.NODE_ENV === "production";
}

export function resolveCommitSha(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): string {
  const raw =
    env.GIT_COMMIT_SHA?.trim() ||
    env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    env.NEXT_PUBLIC_GIT_COMMIT_SHA?.trim() ||
    "";
  return raw.length > 0 ? raw : "unknown";
}

export function resolveBuildTimestamp(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): string {
  const raw =
    env.BUILD_TIMESTAMP?.trim() ||
    env.VERCEL_BUILD_COMPLETED_AT?.trim() ||
    "";
  return raw.length > 0 ? raw : "unknown";
}

function buildIncompleteIdentity(worktreeDirty = false): ReleaseIdentity {
  return {
    project: RELEASE_PROJECT_ID,
    status: "ok",
    commitSha: "unknown",
    buildTimestamp: "unknown",
    identitySource: "incomplete",
    identityComplete: false,
    worktreeDirty,
  };
}

export function buildReleaseIdentity(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
  artifactRoot: string = process.cwd()
): ReleaseIdentity {
  const artifact = readReleaseIdentityArtifact(artifactRoot);
  if (artifact) {
    return {
      project: RELEASE_PROJECT_ID,
      status: "ok",
      commitSha: artifact.commitSha,
      buildTimestamp: artifact.buildTimestamp,
      identitySource: "artifact",
      identityComplete: true,
      worktreeDirty: artifact.worktreeDirty,
    };
  }

  if (!isProductionLikeRuntime(env)) {
    const commitSha = resolveCommitSha(env);
    const buildTimestamp = resolveBuildTimestamp(env);
    const identityComplete =
      commitSha !== "unknown" && buildTimestamp !== "unknown";
    return {
      project: RELEASE_PROJECT_ID,
      status: "ok",
      commitSha,
      buildTimestamp,
      identitySource: identityComplete ? "environment" : "incomplete",
      identityComplete,
      worktreeDirty: false,
    };
  }

  return buildIncompleteIdentity(false);
}

export function releaseIdentityMatchesExpected(
  live: Pick<ReleaseIdentity, "commitSha" | "identityComplete" | "identitySource">,
  expectedSha: string
): boolean {
  const expected = expectedSha.trim();
  if (!expected || expected === "unknown") return false;
  if (live.commitSha === "unknown") return false;
  if (live.identitySource !== "artifact" || !live.identityComplete) return false;
  return live.commitSha === expected;
}

export function serializeReleaseIdentityForResponse(
  identity: ReleaseIdentity
): ReleaseIdentity {
  return identity;
}
