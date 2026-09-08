import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { absoluteCanonical, canonicalAlternate, normalizeCanonicalPath } from "@/lib/seo/canonical";
import { pageTitle } from "@/lib/seo/title";

type MediaLike = { url?: string | null } | string | number | null | undefined;

type SeoDoc = {
  title?: string | null;
  excerpt?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: MediaLike;
  } | null;
  coverImage?: MediaLike;
  cover?: MediaLike;
  coverUrl?: string | null;
  ogImage?: MediaLike;
  gallery?: Array<{ image?: MediaLike }> | null;
};

type SiteSeoDefaults = {
  projectName?: string | null;
  metaDescription?: string | null;
  ogImage?: MediaLike;
};

function mediaUrl(field: MediaLike): string | undefined {
  if (!field) return undefined;
  if (typeof field === "object" && "url" in field && field.url) {
    return String(field.url);
  }
  return undefined;
}

function absoluteUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = getSiteUrl();
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

/**
 * SEO title for entity pages.
 * Uses seo.title when present; otherwise the real title.
 * Does not append the brand — layout `title.template` owns the suffix.
 */
export function getMetaTitle(
  doc: SeoDoc,
  fallbackTitle: string,
  site?: SiteSeoDefaults
): string {
  void site;
  return pageTitle(doc.seo?.title, fallbackTitle || String(doc.title || ""));
}

/**
 * Description fallback contract for CONTENT.1:
 * seo.description → excerpt / shortDescription / description → site default → "".
 * Never invent marketing claims.
 */
export function getMetaDescription(
  doc: SeoDoc,
  site?: SiteSeoDefaults
): string {
  const fromSeo = doc.seo?.description?.trim();
  if (fromSeo) return fromSeo;
  const excerpt =
    doc.excerpt?.trim() ||
    doc.shortDescription?.trim() ||
    doc.description?.trim();
  if (excerpt) return excerpt;
  return site?.metaDescription?.trim() || "";
}

export function getOgImage(
  doc: SeoDoc,
  site?: SiteSeoDefaults
): string | undefined {
  const chain = [
    mediaUrl(doc.seo?.image),
    mediaUrl(doc.coverImage),
    mediaUrl(doc.cover),
    doc.coverUrl ? String(doc.coverUrl) : undefined,
    mediaUrl(doc.ogImage),
    doc.gallery?.[0]?.image ? mediaUrl(doc.gallery[0].image) : undefined,
    mediaUrl(site?.ogImage),
  ];
  for (const url of chain) {
    const abs = absoluteUrl(url);
    if (abs) return abs;
  }
  return undefined;
}

export function buildPageMetadata(
  doc: SeoDoc,
  fallbackTitle: string,
  site?: SiteSeoDefaults,
  options?: {
    path?: string;
    robots?: Metadata["robots"];
    ogType?: "website" | "article";
  }
): Metadata {
  const title = getMetaTitle(doc, fallbackTitle, site);
  const description = getMetaDescription(doc, site);
  const image = getOgImage(doc, site) ?? absoluteUrl("/og-default.jpg");
  const canonicalPath = options?.path
    ? normalizeCanonicalPath(options.path)
    : undefined;

  return {
    title,
    description,
    ...(canonicalPath ? { alternates: canonicalAlternate(canonicalPath) } : {}),
    ...(options?.robots ? { robots: options.robots } : {}),
    openGraph: {
      type: options?.ogType ?? "website",
      title,
      description,
      locale: "ru_RU",
      siteName: site?.projectName?.trim() || "Иркпортал",
      ...(image ? { images: [{ url: image }] } : {}),
      ...(canonicalPath
        ? { url: absoluteCanonical(canonicalPath) }
        : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
