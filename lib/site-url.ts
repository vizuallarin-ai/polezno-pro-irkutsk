/** Canonical production hostname in ASCII IDN form (no trailing slash). */
export const DEFAULT_SITE_HOST =
  "xn--e1aediabqeeaegncqpq.xn--p1ai" as const;
export const DEFAULT_SITE_URL = `https://${DEFAULT_SITE_HOST}`;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}
