import { allowDemoFallback } from "@/lib/demo-fallback";
import { DEMO_SITEMAP_MARKERS } from "@/lib/sitemap-contract";

export function isDemoPublicMarker(value: string): boolean {
  const lower = value.toLowerCase();
  return DEMO_SITEMAP_MARKERS.some((marker) =>
    lower.includes(marker.toLowerCase())
  );
}

/** Published CMS rows must not surface demo/seed markers in public selectors. */
export function isPublishedCommercialCandidate(input: {
  status?: string | null;
  _status?: string | null;
  title?: string | null;
  slug?: string | null;
}): boolean {
  const status = input.status ?? input._status;
  if (status !== "published") return false;
  const title = input.title ?? "";
  const slug = input.slug ?? "";
  return !isDemoPublicMarker(title) && !isDemoPublicMarker(slug);
}

export function shouldUseDemoFallback(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  if (!env.DATABASE_URL) return true;
  return env.ALLOW_DEMO_FALLBACK === "true";
}

export function demoFallbackContractOk(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  if (env.NODE_ENV === "production" && env.DATABASE_URL) {
    return !shouldUseDemoFallback(env);
  }
  return allowDemoFallback() === shouldUseDemoFallback(env);
}
