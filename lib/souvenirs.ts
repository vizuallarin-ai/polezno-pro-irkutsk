import {
  MAKER_PUBLISHED_WHERE,
  PUBLISHED_STATUS_WHERE,
} from "@/lib/cms-filters";
import {
  mapMakerRef,
  mapProductDoc,
  type SouvenirMaker,
  type SouvenirProduct,
} from "@/lib/souvenirs-types";

export type { SouvenirMaker, SouvenirProduct } from "@/lib/souvenirs-types";
export {
  formatProductPrice,
  SOUVENIR_CATEGORY_FILTERS,
} from "@/lib/souvenirs-types";

export async function getPublishedProducts(limit = 100): Promise<SouvenirProduct[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "products",
      where: PUBLISHED_STATUS_WHERE,
      limit,
      sort: "-updatedAt",
      depth: 2,
    });
    return result.docs.map((doc) => mapProductDoc(doc as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(limit = 4): Promise<SouvenirProduct[]> {
  if (!process.env.DATABASE_URL) return [];
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    where: {
      and: [PUBLISHED_STATUS_WHERE, { isFeatured: { equals: true } }],
    },
    limit,
    sort: "-updatedAt",
    depth: 1,
  });
  const docs = result.docs.map((doc) =>
    mapProductDoc(doc as Record<string, unknown>)
  );
  if (docs.length >= 2) return docs;
  const all = await getPublishedProducts(limit);
  return all.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<SouvenirProduct | null> {
  if (!process.env.DATABASE_URL) return null;
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    where: {
      and: [{ slug: { equals: slug } }, PUBLISHED_STATUS_WHERE],
    },
    limit: 1,
    depth: 2,
  });
  const doc = result.docs[0];
  return doc ? mapProductDoc(doc as Record<string, unknown>) : null;
}

export async function getPublishedMakers(limit = 50): Promise<SouvenirMaker[]> {
  if (!process.env.DATABASE_URL) return [];
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "makers",
    where: MAKER_PUBLISHED_WHERE,
    limit,
    sort: "-updatedAt",
    depth: 1,
  });
  return result.docs
    .map((doc) => mapMakerRef(doc))
    .filter((m): m is SouvenirMaker => m !== null);
}

export async function getMakerBySlug(slug: string): Promise<SouvenirMaker | null> {
  if (!process.env.DATABASE_URL) return null;
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "makers",
    where: {
      and: [{ slug: { equals: slug } }, MAKER_PUBLISHED_WHERE],
    },
    limit: 1,
    depth: 1,
  });
  const doc = result.docs[0];
  return doc ? mapMakerRef(doc) : null;
}

export async function getProductsByMaker(makerId: string): Promise<SouvenirProduct[]> {
  if (!process.env.DATABASE_URL) return [];
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    where: {
      and: [PUBLISHED_STATUS_WHERE, { maker: { equals: makerId } }],
    },
    limit: 50,
    depth: 1,
  });
  return result.docs.map((doc) => mapProductDoc(doc as Record<string, unknown>));
}

export async function getProductsForRoute(
  routeSlug: string,
  limit = 6
): Promise<SouvenirProduct[]> {
  if (!process.env.DATABASE_URL) return [];
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();

  const routeRes = await payload.find({
    collection: "routes",
    where: { slug: { equals: routeSlug } },
    limit: 1,
    depth: 0,
  });
  const routeId = routeRes.docs[0]?.id;
  if (!routeId) return [];

  const result = await payload.find({
    collection: "products",
    where: {
      and: [
        PUBLISHED_STATUS_WHERE,
        {
          or: [
            { relatedRoute: { equals: routeId } },
            { relatedRoutes: { contains: routeId } },
          ],
        },
      ],
    },
    limit,
    depth: 1,
  });
  return result.docs.map((doc) => mapProductDoc(doc as Record<string, unknown>));
}

export async function getProductsForArticle(
  articleSlug: string,
  limit = 6
): Promise<SouvenirProduct[]> {
  if (!process.env.DATABASE_URL) return [];
  const { getPayloadClient } = await import("@/lib/payload");
  const payload = await getPayloadClient();

  const articleRes = await payload.find({
    collection: "articles",
    where: { slug: { equals: articleSlug } },
    limit: 1,
    depth: 0,
  });
  const articleId = articleRes.docs[0]?.id;
  if (!articleId) return [];

  const result = await payload.find({
    collection: "products",
    where: {
      and: [
        PUBLISHED_STATUS_WHERE,
        {
          or: [
            { relatedArticle: { equals: articleId } },
            { relatedArticles: { contains: articleId } },
          ],
        },
      ],
    },
    limit,
    depth: 1,
  });
  return result.docs.map((doc) => mapProductDoc(doc as Record<string, unknown>));
}

export async function getPublishedProductSlugs(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "products",
      where: PUBLISHED_STATUS_WHERE,
      limit: 1000,
      depth: 0,
    });
    return result.docs.map((doc) => String(doc.slug));
  } catch {
    return [];
  }
}

export async function getPublishedMakerSlugs(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "makers",
      where: MAKER_PUBLISHED_WHERE,
      limit: 1000,
      depth: 0,
    });
    return result.docs.map((doc) => String(doc.slug));
  } catch {
    return [];
  }
}
