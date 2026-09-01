/** Build/runtime release identity for irkportal.ru (no secrets, no paths). */

export const RELEASE_PROJECT_ID = "irkportal" as const;

export type ReleaseIdentity = {
  project: typeof RELEASE_PROJECT_ID;
  status: "ok";
  commitSha: string;
  buildTimestamp: string;
};

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

export function buildReleaseIdentity(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): ReleaseIdentity {
  return {
    project: RELEASE_PROJECT_ID,
    status: "ok",
    commitSha: resolveCommitSha(env),
    buildTimestamp: resolveBuildTimestamp(env),
  };
}

export function releaseIdentityMatchesExpected(
  live: Pick<ReleaseIdentity, "commitSha">,
  expectedSha: string
): boolean {
  const expected = expectedSha.trim();
  if (!expected || expected === "unknown") return false;
  if (live.commitSha === "unknown") return false;
  return live.commitSha === expected;
}
