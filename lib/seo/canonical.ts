import { getSiteUrl } from "@/lib/site-url";

/** Normalize a site path to a leading-slash, no-trailing-slash form (except `/`). */
export function normalizeCanonicalPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

/** Absolute canonical URL on the configured host. */
export function absoluteCanonical(path: string, baseUrl = getSiteUrl()): string {
  const base = baseUrl.replace(/\/$/, "");
  const normalized = normalizeCanonicalPath(path);
  return normalized === "/" ? base : `${base}${normalized}`;
}

export function canonicalAlternate(path: string) {
  return { canonical: normalizeCanonicalPath(path) };
}
