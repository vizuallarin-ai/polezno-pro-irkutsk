import { PUBLISHED_STATUS_WHERE } from "@/lib/cms-filters";

export const EXCURSION_FORMAT_LABELS: Record<string, string> = {
  walking: "Пешая",
  bus: "Автобусная",
  gastro: "Гастро",
  author: "Авторская",
  corporate: "Корпоративная",
  baikal: "Байкал",
  night: "Ночная",
};

export type ExcursionDoc = {
  id: string | number;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription?: string | null;
  format: string;
  price?: number | null;
  priceOnRequest?: boolean | null;
  duration?: number | null;
  groupSize?: string | null;
  coverUrl?: string | null;
  cover?: { url?: string; alt?: string } | null;
  includes?: Array<{ item: string }> | null;
  excludes?: Array<{ item: string }> | null;
  relatedRoutes?: Array<{
    slug: string;
    title: string;
    description?: string | null;
  }> | null;
  showInRoutesPage?: boolean | null;
};

export async function getPublishedExcursions(): Promise<ExcursionDoc[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "excursions",
      where: PUBLISHED_STATUS_WHERE,
      limit: 50,
      sort: "-updatedAt",
      depth: 1,
    });
    return result.docs.map((doc) => mapExcursionDoc(doc as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getExcursionBySlug(
  slug: string
): Promise<ExcursionDoc | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "excursions",
      where: {
        and: [{ slug: { equals: slug } }, PUBLISHED_STATUS_WHERE],
      },
      limit: 1,
      depth: 2,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return mapExcursionDoc(doc);
  } catch {
    return null;
  }
}

function mapExcursionDoc(doc: Record<string, unknown>): ExcursionDoc {
  const relatedRoutes = Array.isArray(doc.relatedRoutes)
    ? doc.relatedRoutes
        .filter((r) => r && typeof r === "object" && "slug" in r)
        .map((r) => ({
          slug: String((r as { slug: string }).slug),
          title: String((r as { title: string }).title),
          description: (r as { description?: string }).description
            ? String((r as { description: string }).description)
            : undefined,
        }))
    : null;

  return {
    id: doc.id as string | number,
    slug: String(doc.slug),
    title: String(doc.title),
    shortDescription: String(doc.shortDescription),
    fullDescription: doc.fullDescription ? String(doc.fullDescription) : null,
    format: String(doc.format),
    price: doc.price != null ? Number(doc.price) : null,
    priceOnRequest: Boolean(doc.priceOnRequest),
    duration: doc.duration != null ? Number(doc.duration) : null,
    groupSize: doc.groupSize ? String(doc.groupSize) : null,
    coverUrl: doc.coverUrl ? String(doc.coverUrl) : null,
    cover: doc.cover as ExcursionDoc["cover"],
    includes: doc.includes as ExcursionDoc["includes"],
    excludes: doc.excludes as ExcursionDoc["excludes"],
    relatedRoutes,
    showInRoutesPage: doc.showInRoutesPage !== false,
  };
}

/** First published excursion linked to a route slug, if any. */
export async function getExcursionForRoute(
  routeSlug: string
): Promise<ExcursionDoc | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const routeRes = await payload.find({
      collection: "routes",
      where: { slug: { equals: routeSlug } },
      limit: 1,
      depth: 0,
    });
    const routeId = routeRes.docs[0]?.id;
    if (!routeId) return null;

    const result = await payload.find({
      collection: "excursions",
      where: {
        and: [
          PUBLISHED_STATUS_WHERE,
          { relatedRoutes: { contains: routeId } },
        ],
      },
      limit: 1,
      depth: 1,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return {
      id: doc.id,
      slug: String(doc.slug),
      title: String(doc.title),
      shortDescription: String(doc.shortDescription),
      format: String(doc.format),
      price: doc.price != null ? Number(doc.price) : null,
      duration: doc.duration != null ? Number(doc.duration) : null,
    };
  } catch {
    return null;
  }
}

export function formatExcursionDuration(minutes: number | null | undefined): string {
  if (!minutes) return "";
  if (minutes >= 240) return "Полдня";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ч`;
  if (h === 0) return `${m} мин`;
  return `${h} ч ${m} мин`;
}

export function excursionCoverUrl(excursion: ExcursionDoc): string | undefined {
  return excursion.cover?.url || excursion.coverUrl || undefined;
}
