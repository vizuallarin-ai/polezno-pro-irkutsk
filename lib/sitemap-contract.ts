import { getSiteUrl } from "@/lib/site-url";

/** Required static paths in production sitemap (without host). */
export const REQUIRED_SITEMAP_STATIC_PATHS = [
  "/",
  "/map",
  "/explore",
  "/business",
  "/contact",
  "/about",
  "/privacy",
  "/robots.txt",
] as const;

/** Markers that must not appear in public crawl when published from CMS. */
export const DEMO_SITEMAP_MARKERS = [
  "Демо",
  "demo-",
  "seed-",
  "[CKR",
  "[E2E",
  "test-baseline",
] as const;

export function getRequiredSitemapStaticUrls(baseUrl = getSiteUrl()): string[] {
  const base = baseUrl.replace(/\/$/, "");
  return REQUIRED_SITEMAP_STATIC_PATHS.filter((p) => p !== "/robots.txt").map(
    (path) => `${base}${path === "/" ? "" : path}`
  );
}

export function isValidSitemapXml(body: string): boolean {
  return body.includes("<urlset") && body.includes("</urlset>");
}

export function sitemapContainsRequiredStaticUrls(
  body: string,
  baseUrl = getSiteUrl()
): boolean {
  const required = getRequiredSitemapStaticUrls(baseUrl);
  return required.every((url) => body.includes(`<loc>${url}</loc>`));
}

export function sitemapContainsDemoMarkers(body: string): string[] {
  return DEMO_SITEMAP_MARKERS.filter((marker) => body.includes(marker));
}

export type SitemapCmsLogContext = {
  phase: "sitemap_cms_urls";
  outcome: "error";
  errorName: string;
  errorMessage: string;
};

/** Sanitized structured log payload — no SQL, DSN, PII, or secrets. */
export function sanitizeSitemapLogMessage(message: string): string {
  return message
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[redacted-dsn]")
    .slice(0, 200);
}

export function buildSitemapCmsErrorLog(error: unknown): SitemapCmsLogContext {
  if (error instanceof Error) {
    return {
      phase: "sitemap_cms_urls",
      outcome: "error",
      errorName: error.name.slice(0, 80),
      errorMessage: sanitizeSitemapLogMessage(error.message),
    };
  }
  return {
    phase: "sitemap_cms_urls",
    outcome: "error",
    errorName: "UnknownError",
    errorMessage: "Non-Error thrown in getCmsUrls",
  };
}

export function logSitemapCmsError(error: unknown): void {
  console.error(JSON.stringify(buildSitemapCmsErrorLog(error)));
}
