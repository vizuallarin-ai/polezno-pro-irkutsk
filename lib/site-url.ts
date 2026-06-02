/** Canonical site URL (no trailing slash). */
export const DEFAULT_SITE_URL = "https://irkportal.ru";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}
