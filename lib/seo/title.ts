import { BRAND } from "@/lib/brand-constants";

const BRAND_SUFFIX_RE = new RegExp(
  `\\s*[|—–-]\\s*${escapeRegExp(BRAND.projectName)}\\s*$`,
  "i"
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strip a trailing brand segment so layout `title.template` does not double-brand. */
export function stripBrandSuffix(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  return trimmed.replace(BRAND_SUFFIX_RE, "").trim() || trimmed;
}

/**
 * Page title for the root `title.template` (`%s | Иркпортал`).
 * Prefer CMS seoTitle; otherwise the real entity/section title — never invent marketing copy.
 */
export function pageTitle(
  seoTitle: string | null | undefined,
  fallbackTitle: string
): string {
  const fromSeo = seoTitle?.trim();
  if (fromSeo) return stripBrandSuffix(fromSeo);
  return stripBrandSuffix(fallbackTitle);
}

/** Home / special pages that must not use the layout template. */
export function absoluteTitle(title: string): { absolute: string } {
  return { absolute: title.trim() };
}
