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
};

const DEMO_SLUG_EXACT = new Set([
  "demo-product",
  "demo-route",
  "demo-excursion",
  "demo-ar",
  "test-baseline",
]);

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

function hasDemoSignals(input: CommercialRecordInput): boolean {
  if (input.isDemo === true) return true;
  const title = displayTitle(input);
  const slug = (input.slug ?? "").trim();
  return (
    (title.length > 0 && isDemoPublicMarker(title)) ||
    (slug.length > 0 && isDemoPublicMarker(slug))
  );
}

function hasMinimumFields(input: CommercialRecordInput): boolean {
  const title = displayTitle(input);
  const slug = (input.slug ?? "").trim();

  switch (input.kind) {
    case "guide":
      return title.length > 0 && title !== "Имя Гида";
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
      return title.length > 0 && slug.length > 0;
    case "photo":
      return title.length > 0 && slug.length > 0;
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
