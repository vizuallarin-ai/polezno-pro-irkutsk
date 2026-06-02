import type { Route, RouteDifficulty, RouteFormat } from "@/lib/data/routes";
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
    filters: [routeType, mapCategory].filter(Boolean) as Route["filters"],
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
  };
}

export function isPublishedRoute(doc: { status?: string }): boolean {
  return doc.status === "published";
}
