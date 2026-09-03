/**
 * Path normalization and allowed-prefix checks for immutable release deploy.
 * Never authorize broad filesystem deletion outside explicitly scoped targets.
 */

import path from "node:path";

/** Full 40-char lowercase hex git commit SHA. */
export const COMMIT_SHA_FULL_PATTERN = /^[0-9a-f]{40}$/;

/**
 * Normalize to an absolute path with consistent separators (no trailing slash
 * except drive roots). Rejects empty input.
 */
export function normalizeAbsolutePath(p: string): string {
  if (typeof p !== "string" || p.trim() === "") {
    throw new Error("normalizeAbsolutePath: path must be a non-empty string");
  }
  const resolved = path.resolve(p.trim());
  // Strip trailing separator except for root (/, C:\)
  if (resolved.length > 1 && (resolved.endsWith("/") || resolved.endsWith("\\"))) {
    return resolved.replace(/[/\\]+$/, "");
  }
  return resolved;
}

/**
 * Ensure `target` resolves under one of `allowedPrefixes`.
 * Throws if the path escapes via `..` or is outside every prefix.
 */
export function assertAllowedDeployPath(
  target: string,
  allowedPrefixes: string[]
): void {
  if (!Array.isArray(allowedPrefixes) || allowedPrefixes.length === 0) {
    throw new Error("assertAllowedDeployPath: allowedPrefixes must be non-empty");
  }

  const normalizedTarget = normalizeAbsolutePath(target);
  const normalizedPrefixes = allowedPrefixes.map((prefix) =>
    normalizeAbsolutePath(prefix)
  );

  const allowed = normalizedPrefixes.some((prefix) => {
    if (normalizedTarget === prefix) return true;
    const prefixWithSep = prefix.endsWith(path.sep)
      ? prefix
      : prefix + path.sep;
    return normalizedTarget.startsWith(prefixWithSep);
  });

  if (!allowed) {
    throw new Error(
      `assertAllowedDeployPath: path is outside allowed prefixes: ${normalizedTarget}`
    );
  }
}

/**
 * Release directory names must be exactly a full 40-char hex SHA.
 * Rejects short SHAs, uppercase, paths, and relative segments.
 */
export function isSafeReleaseDirName(name: string): boolean {
  if (typeof name !== "string") return false;
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return false;
  }
  return COMMIT_SHA_FULL_PATTERN.test(name);
}
