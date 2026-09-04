/**
 * Canonical content readiness contract for public commercial surfaces.
 * All listings, detail pages, sitemap, related content, and APIs must use this.
 * Fail-closed for demo / incomplete content in ordinary public mode.
 */

import { DEMO_SITEMAP_MARKERS } from "@/lib/sitemap-contract";

export type ContentReadiness =
  | "published-ready"
  | "draft-preview"
  | "demo"
  | "incomplete"
  | "empty";

export type CommercialKind =
  | "route"
  | "excursion"
  | "product"
  | "ar_postcard"
  | "photo"
  | "article"
  | "guide"
  | "event"
  | "maker";

export type CommercialRecordInput = {
  kind: CommercialKind;
  status?: string | null;
  _status?: string | null;
  title?: string | null;
  slug?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  moderationStatus?: string | null;
  placementStatus?: string | null;
  price?: number | null;
  priceOnRequest?: boolean | null;
  /** Explicit seed/demo flag from CMS when present */
  isDemo?: boolean | null;
  /** Preview/admin context — draft-preview may be shown */
  allowPreview?: boolean;
  /** Media alt texts — seed placeholders often mark demo here, not in title */
  altTexts?: Array<string | null | undefined>;
  /** Media filenames — seed files use seed-/demo- prefixes */
  mediaFilenames?: Array<string | null | undefined>;
  /** Media URLs — may contain seed-placeholder path segments */
  mediaUrls?: Array<string | null | undefined>;
};

export type PublicSurfaceDecision = {
  state: ContentReadiness;
  listing: boolean;
  detail: boolean;
  sitemap: boolean;
  indexable: boolean;
};

const DEMO_SLUG_EXACT = new Set([
  "demo-product",
  "demo-route",
  "demo-excursion",
  "demo-ar",
  "test-baseline",
]);

const GUIDE_PLACEHOLDER_TITLES = new Set([
  "имя гида",
  "гид",
  "name",
  "guide",
  "placeholder",
]);

const GUIDE_PLACEHOLDER_SLUGS = new Set([
  "slug",
  "guide",
  "placeholder",
  "имя-гида",
  "name",
  "test",
  "demo-guide",
]);

const OWN_MEDIA_KEYS = [
  "image",
  "cover",
  "coverImage",
  "postcardImage",
  "photo",
  "gallery",
  "seo",
  "animationPosterImage",
  "animationPoster",
  "avatar",
  "poster",
] as const;

export function isDemoPublicMarker(value: string): boolean {
  const lower = value.toLowerCase();
  if (DEMO_SLUG_EXACT.has(lower)) return true;
  return DEMO_SITEMAP_MARKERS.some((marker) =>
    lower.includes(marker.toLowerCase())
  );
}

function displayTitle(input: CommercialRecordInput): string {
  return (input.title ?? input.name ?? "").trim();
}

function isDraftStatus(input: CommercialRecordInput): boolean {
  const status = input.status ?? null;
  const draftStatus = input._status ?? null;
  if (draftStatus === "draft") return true;
  if (status === "draft" || status === "hidden" || status === "archived") {
    return true;
  }
  if (input.kind === "guide" && input.isActive === false) return true;
  return false;
}

function isPublishedStatus(input: CommercialRecordInput): boolean {
  if (input.kind === "guide") {
    return input.isActive === true;
  }
  const status = input.status ?? null;
  if (status !== "published") return false;
  if (input.kind === "article" && input._status != null && input._status !== "published") {
    return false;
  }
  if (input.kind === "photo" && input.moderationStatus != null) {
    return input.moderationStatus === "approved";
  }
  if (input.kind === "maker" && input.placementStatus != null) {
    return input.placementStatus === "active";
  }
  return true;
}

function collectSignalTexts(input: CommercialRecordInput): string[] {
  const values = [
    displayTitle(input),
    input.slug,
    input.shortDescription,
    input.description,
    ...(input.altTexts ?? []),
    ...(input.mediaFilenames ?? []),
    ...(input.mediaUrls ?? []),
  ];
  return values.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function hasDemoSignals(input: CommercialRecordInput): boolean {
  if (input.isDemo === true) return true;
  return collectSignalTexts(input).some((value) => isDemoPublicMarker(value));
}

function isGuidePlaceholder(input: CommercialRecordInput): boolean {
  if (input.kind !== "guide") return false;
  const title = displayTitle(input).toLowerCase();
  const slug = (input.slug ?? "").trim().toLowerCase();
  if (title.length > 0 && GUIDE_PLACEHOLDER_TITLES.has(title)) return true;
  if (slug.length > 0 && GUIDE_PLACEHOLDER_SLUGS.has(slug)) return true;
  return false;
}

function hasMinimumFields(input: CommercialRecordInput): boolean {
  const title = displayTitle(input);
  const slug = (input.slug ?? "").trim();

  if (input.kind === "guide") {
    return title.length > 0 && slug.length > 0 && !isGuidePlaceholder(input);
  }

  switch (input.kind) {
    case "route":
      return title.length > 0 && slug.length > 0;
    case "excursion":
      return (
        title.length > 0 &&
        slug.length > 0 &&
        Boolean((input.shortDescription ?? input.description ?? "").trim())
      );
    case "product":
    case "ar_postcard":
    case "maker":
    case "event":
    case "photo":
    case "article":
      return title.length > 0 && slug.length > 0;
    default:
      return title.length > 0 && slug.length > 0;
  }
}

/**
 * Classify a single commercial CMS record.
 * Demo markers win over published status (fail-closed for public).
 */
export function classifyCommercialRecord(
  input: CommercialRecordInput
): ContentReadiness {
  if (hasDemoSignals(input)) return "demo";

  if (isDraftStatus(input) || !isPublishedStatus(input)) {
    return input.allowPreview ? "draft-preview" : "incomplete";
  }

  if (!hasMinimumFields(input)) return "incomplete";

  return "published-ready";
}

/** Ordinary public surfaces: only published-ready. */
export function isPublicPublishedReady(
  input: CommercialRecordInput
): boolean {
  return classifyCommercialRecord({ ...input, allowPreview: false }) ===
    "published-ready";
}

/** Sitemap / public listings must exclude demo and incomplete. */
export function isSitemapEligible(input: CommercialRecordInput): boolean {
  return isPublicPublishedReady(input);
}

/**
 * Detail page gate: demo and incomplete → notFound in public mode.
 * draft-preview only when allowPreview is true.
 */
export function mayRenderPublicDetail(
  input: CommercialRecordInput
): boolean {
  const state = classifyCommercialRecord(input);
  if (state === "published-ready") return true;
  if (state === "draft-preview" && input.allowPreview) return true;
  return false;
}

export function filterPublishedReady<T extends CommercialRecordInput>(
  records: T[]
): T[] {
  return records.filter((r) => isPublicPublishedReady(r));
}

export function catalogReadiness(
  count: number
): Extract<ContentReadiness, "empty" | "published-ready"> {
  return count > 0 ? "published-ready" : "empty";
}

/** Section listing pages stay reachable even when the catalog is empty. */
export function isSectionPagePublic(): true {
  return true;
}

/**
 * One decision for listing / public detail / sitemap / indexability.
 * Admin preview is a separate allowPreview path and is not indexable.
 */
export function publicSurfacesForRecord(
  input: CommercialRecordInput
): PublicSurfaceDecision {
  const publicInput = { ...input, allowPreview: false };
  const state = classifyCommercialRecord(publicInput);
  const listing = isPublicPublishedReady(publicInput);
  const detail = mayRenderPublicDetail(publicInput);
  const sitemap = isSitemapEligible(publicInput);
  return {
    state,
    listing,
    detail,
    sitemap,
    indexable: listing && detail && sitemap,
  };
}

type MediaSignals = {
  alts: string[];
  filenames: string[];
  urls: string[];
};

function collectMediaSignals(
  value: unknown,
  acc: MediaSignals,
  depth: number
): void {
  if (depth > 3 || value == null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collectMediaSignals(item, acc, depth + 1);
    return;
  }
  const rec = value as Record<string, unknown>;
  if (typeof rec.alt === "string" && rec.alt.trim()) acc.alts.push(rec.alt);
  if (typeof rec.filename === "string" && rec.filename.trim()) {
    acc.filenames.push(rec.filename);
  }
  if (typeof rec.url === "string" && rec.url.trim()) acc.urls.push(rec.url);
  if ("image" in rec) collectMediaSignals(rec.image, acc, depth + 1);
}

export function extractOwnMediaSignals(doc: Record<string, unknown>): MediaSignals {
  const acc: MediaSignals = { alts: [], filenames: [], urls: [] };
  for (const key of OWN_MEDIA_KEYS) {
    if (key in doc) collectMediaSignals(doc[key], acc, 0);
  }
  return acc;
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Build the canonical readiness input from a CMS document (own media only). */
export function commercialInputFromDoc(
  kind: CommercialKind,
  doc: Record<string, unknown>,
  extras: Partial<CommercialRecordInput> = {}
): CommercialRecordInput {
  const media = extractOwnMediaSignals(doc);
  return {
    kind,
    status: asOptionalString(doc.status),
    _status: asOptionalString(doc._status),
    title: asOptionalString(doc.title),
    name: asOptionalString(doc.name),
    slug: asOptionalString(doc.slug),
    shortDescription: asOptionalString(doc.shortDescription),
    description: asOptionalString(doc.description),
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : null,
    moderationStatus: asOptionalString(doc.moderationStatus),
    placementStatus: asOptionalString(doc.placementStatus),
    price: typeof doc.price === "number" ? doc.price : null,
    priceOnRequest:
      typeof doc.priceOnRequest === "boolean" ? doc.priceOnRequest : null,
    isDemo: doc.isDemo === true,
    altTexts: media.alts,
    mediaFilenames: media.filenames,
    mediaUrls: media.urls,
    ...extras,
  };
}

export function isCmsDocPublicReady(
  kind: CommercialKind,
  doc: Record<string, unknown>
): boolean {
  return isPublicPublishedReady(commercialInputFromDoc(kind, doc));
}

/** @deprecated Prefer classifyCommercialRecord — kept for phase15-checks compat */
export function isPublishedCommercialCandidate(input: {
  status?: string | null;
  _status?: string | null;
  title?: string | null;
  slug?: string | null;
}): boolean {
  return isPublicPublishedReady({
    kind: "route",
    status: input.status ?? input._status,
    title: input.title,
    slug: input.slug,
  });
}
