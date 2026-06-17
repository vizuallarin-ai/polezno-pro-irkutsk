import type { Route, RouteDifficulty, RouteFormat, RouteFilterId } from "@/lib/data/routes";
import type { RouteCategory } from "@/types/map";

type MediaRef = { url?: string; alt?: string } | string | null | undefined;

type RoutePointDoc = {
  id?: string;
  title?: string;
  lat?: number;
  lng?: number;
  description?: string;
  whatToNotice?: string;
  timeOnSite?: string;
  image?: MediaRef;
  order?: number;
  published?: boolean;
};

type RouteDoc = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  fullDescription?: string;
  category?: RouteCategory;
  type?: "free" | "paid";
  format?: RouteFormat;
  price?: number;
  duration?: number;
  distance?: number;
  difficulty?: RouteDifficulty;
  tags?: Array<{ tag?: string } | string>;
  cover?: MediaRef;
  coverUrl?: string;
  pointsCount?: number;
  routePoints?: RoutePointDoc[];
  geoLine?: { type?: string; coordinates?: [number, number][] };
  seo?: { title?: string; description?: string };
  status?: string;
  isSelfGuided?: boolean;
  isGuidedAvailable?: boolean;
  isCorporateAvailable?: boolean;
  priceLabel?: string;
  bookingCta?: string;
  bookingDescription?: string;
  experienceType?: string;
};

function mediaUrl(ref: MediaRef): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref.url;
}

function normalizeTags(tags: RouteDoc["tags"]): string[] {
  if (!tags?.length) return [];
  return tags.map((t) => (typeof t === "string" ? t : t.tag ?? "")).filter(Boolean);
}

function tagMatches(tags: string[], needles: string[]): boolean {
  const lower = tags.map((t) => t.toLowerCase());
  return needles.some((n) => lower.some((t) => t.includes(n)));
}

/** Derive catalog filter tags from route fields — mirrors DEMO_ROUTES logic. */
export function computeRouteFilters(doc: RouteDoc): RouteFilterId[] {
  const filters = new Set<RouteFilterId>();
  const routeType = doc.type ?? "free";
  filters.add(routeType);

  const format = doc.format ?? "walking";
  if (format === "walking" || format === "author" || format === "gastro") {
    filters.add("walking");
  }
  if (format === "gastro") filters.add("gastro");
  if (format === "baikal") filters.add("baikal-nearby");

  const duration = doc.duration ?? 90;
  if (duration > 0 && duration <= 150) filters.add("1-2h");
  if (duration >= 240) filters.add("half-day");

  const category = doc.category ?? "history";
  if (category === "architecture" || category === "wooden") {
    filters.add("architecture");
  }
  if (
    category === "history" ||
    category === "decembrists" ||
    category === "soviet"
  ) {
    filters.add("history");
  }
  if (category === "gastronomy") filters.add("gastro");
  if (category === "hidden") filters.add("locals");

  const tags = normalizeTags(doc.tags);
  if (tagMatches(tags, ["первое", "первый", "знакомство", "first"])) {
    filters.add("first-visit");
  }
  if (tagMatches(tags, ["местн", "локал", "двор"])) {
    filters.add("locals");
  }
  if (tagMatches(tags, ["гастро", "еда", "кофе"])) {
    filters.add("gastro");
  }
  if (tagMatches(tags, ["байкал", "baikal"])) {
    filters.add("baikal-nearby");
  }

  const experienceType = doc.experienceType;
  if (experienceType === "first-visit") filters.add("first-visit");
  if (experienceType === "gastro") filters.add("gastro");
  if (experienceType === "baikal") filters.add("baikal-nearby");
  if (experienceType === "corporate") {
    // corporate is handled via isCorporateAvailable on ExperienceItem
  }

  return [...filters];
}

export function payloadRouteToRoute(doc: RouteDoc): Route {
  const publishedPoints = (doc.routePoints ?? [])
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const routeLine =
    doc.geoLine?.coordinates ??
    publishedPoints.map((p) => [p.lng ?? 0, p.lat ?? 0] as [number, number]);

  const mapCategory = doc.category ?? "history";
  const routeType = doc.type ?? "free";

  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    description: doc.description ?? "",
    fullDescription: doc.fullDescription ?? doc.description ?? "",
    format: doc.format ?? "walking",
    mapCategory,
    type: routeType,
    price: doc.price,
    duration: doc.duration ?? 90,
    distance: doc.distance ?? 3,
    pointsCount: doc.pointsCount ?? publishedPoints.length,
    difficulty: doc.difficulty ?? "medium",
    tags: normalizeTags(doc.tags),
    filters: computeRouteFilters(doc),
    coverImage: mediaUrl(doc.cover) ?? doc.coverUrl,
    routeLine,
    points: publishedPoints.map((p, i) => ({
      id: p.id ?? `point-${i}`,
      order: p.order ?? i + 1,
      title: p.title ?? "",
      description: p.description ?? "",
      whatToNotice: p.whatToNotice ?? "",
      time: p.timeOnSite,
      coordinates: { lat: p.lat ?? 0, lng: p.lng ?? 0 },
      image: mediaUrl(p.image),
    })),
    isSelfGuided: doc.isSelfGuided !== false,
    isGuidedAvailable: doc.isGuidedAvailable !== false,
    isCorporateAvailable: Boolean(doc.isCorporateAvailable),
    priceLabel: doc.priceLabel,
    bookingCta: doc.bookingCta,
    bookingDescription: doc.bookingDescription,
    experienceType:
      doc.experienceType && doc.experienceType.length > 0
        ? (doc.experienceType as Route["experienceType"])
        : undefined,
  };
}

export function isPublishedRoute(doc: { status?: string }): boolean {
  return doc.status === "published";
}
