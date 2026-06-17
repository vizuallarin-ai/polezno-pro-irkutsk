import { ARTICLE_PUBLISHED_WHERE } from "@/lib/cms-filters";
import {
  getDemoExploreMaterial,
  getDemoExploreMaterialsByCategory,
  getFeaturedDemoMaterials,
  type ExploreMaterial,
} from "@/lib/data/explore-materials";
import { getDemoRouteBySlug } from "@/lib/data/routes";
import { isExploreCategorySlug } from "@/lib/explore-constants";

export type ExploreMaterialView = ExploreMaterial & {
  source: "cms" | "demo";
  relatedRoute?: {
    slug: string;
    title: string;
    description?: string;
    coverImage?: { url?: string; alt?: string };
  } | null;
};

type CmsArticleDoc = {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string | null;
  category: string;
  content?: unknown;
  coverImage?: { url?: string; alt?: string } | null;
  coverUrl?: string | null;
  readTime?: number | null;
  isHiddenGem?: boolean | null;
  isFeatured?: boolean | null;
  author?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  updatedAt?: string;
  relatedRoute?:
    | { slug: string; title: string; description?: string; coverImage?: { url?: string; alt?: string } }
    | string
    | number
    | null;
  seo?: { title?: string; description?: string } | null;
};

async function getPayloadSafe() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    return await getPayloadClient();
  } catch {
    return null;
  }
}

function coverFromDoc(doc: {
  coverImage?: { url?: string } | null;
  coverUrl?: string | null;
}): string {
  if (doc.coverImage?.url) return String(doc.coverImage.url);
  if (doc.coverUrl) return String(doc.coverUrl);
  return "/images/placeholder.svg";
}

function mapCmsDoc(doc: CmsArticleDoc): ExploreMaterialView {
  const relatedRoute =
    doc.relatedRoute && typeof doc.relatedRoute === "object" && "slug" in doc.relatedRoute
      ? {
          slug: doc.relatedRoute.slug,
          title: doc.relatedRoute.title,
          description: doc.relatedRoute.description,
          coverImage: doc.relatedRoute.coverImage,
        }
      : null;

  return {
    id: String(doc.id),
    slug: String(doc.slug),
    title: String(doc.title),
    excerpt: String(doc.excerpt || ""),
    category: String(doc.category),
    content: (doc.content || null) as ExploreMaterial["content"],
    coverUrl: coverFromDoc(doc),
    readTime: doc.readTime != null ? Number(doc.readTime) : undefined,
    isFeatured: Boolean(doc.isFeatured),
    isHiddenGem: Boolean(doc.isHiddenGem),
    authorName: doc.authorName
      ? String(doc.authorName)
      : doc.author
        ? String(doc.author)
        : undefined,
    publishedAt: doc.publishedAt ? String(doc.publishedAt) : undefined,
    seoTitle: doc.seo?.title ? String(doc.seo.title) : undefined,
    seoDescription: doc.seo?.description ? String(doc.seo.description) : undefined,
    source: "cms",
    relatedRoute,
  };
}

function mapDemoMaterial(m: ExploreMaterial): ExploreMaterialView {
  const route = m.relatedRouteSlug
    ? getDemoRouteBySlug(m.relatedRouteSlug)
    : undefined;

  return {
    ...m,
    source: "demo",
    relatedRoute: route
      ? {
          slug: route.slug,
          title: route.title,
          description: route.description,
          coverImage: route.coverImage
            ? { url: route.coverImage, alt: route.title }
            : undefined,
        }
      : null,
  };
}

export async function getExploreMaterial(
  slug: string
): Promise<ExploreMaterialView | null> {
  if (isExploreCategorySlug(slug)) return null;

  const payload = await getPayloadSafe();
  if (payload) {
    try {
      const result = await payload.find({
        collection: "articles",
        where: {
          and: [{ slug: { equals: slug } }, ARTICLE_PUBLISHED_WHERE],
        },
        limit: 1,
        depth: 2,
      });
      const doc = result.docs[0] as CmsArticleDoc | undefined;
      if (doc) return mapCmsDoc(doc);
    } catch {
      /* fallback below */
    }
  }

  const demo = getDemoExploreMaterial(slug);
  return demo ? mapDemoMaterial(demo) : null;
}

export async function getExploreMaterialsByCategory(
  category: string
): Promise<ExploreMaterialView[]> {
  const payload = await getPayloadSafe();
  const merged: ExploreMaterialView[] = [];
  const seen = new Set<string>();

  if (payload) {
    try {
      const result = await payload.find({
        collection: "articles",
        where: {
          and: [{ category: { equals: category } }, ARTICLE_PUBLISHED_WHERE],
        },
        limit: 50,
        sort: "-publishedAt",
        depth: 1,
      });
      for (const doc of result.docs as CmsArticleDoc[]) {
        const mapped = mapCmsDoc(doc);
        seen.add(mapped.slug);
        merged.push(mapped);
      }
    } catch {
      /* merge with demo */
    }
  }

  for (const demo of getDemoExploreMaterialsByCategory(category)) {
    if (!seen.has(demo.slug)) {
      merged.push(mapDemoMaterial(demo));
    }
  }

  return merged;
}

export async function getFeaturedExploreMaterials(
  limit = 6
): Promise<ExploreMaterialView[]> {
  const payload = await getPayloadSafe();
  const merged: ExploreMaterialView[] = [];
  const seen = new Set<string>();

  if (payload) {
    try {
      const featured = await payload.find({
        collection: "articles",
        where: {
          and: [ARTICLE_PUBLISHED_WHERE, { isFeatured: { equals: true } }],
        },
        limit,
        sort: "-publishedAt",
        depth: 1,
      });

      const pool =
        featured.docs.length > 0
          ? featured.docs
          : (
              await payload.find({
                collection: "articles",
                where: ARTICLE_PUBLISHED_WHERE,
                limit,
                sort: "-publishedAt",
                depth: 1,
              })
            ).docs;

      for (const doc of pool as CmsArticleDoc[]) {
        const mapped = mapCmsDoc(doc);
        if (!seen.has(mapped.slug)) {
          seen.add(mapped.slug);
          merged.push(mapped);
        }
      }
    } catch {
      /* merge with demo */
    }
  }

  for (const demo of getFeaturedDemoMaterials(limit)) {
    if (!seen.has(demo.slug) && merged.length < limit) {
      seen.add(demo.slug);
      merged.push(mapDemoMaterial(demo));
    }
  }

  return merged.slice(0, limit);
}

export async function getSimilarExploreMaterials(
  slug: string,
  category: string,
  limit = 3
): Promise<ExploreMaterialView[]> {
  const inCategory = await getExploreMaterialsByCategory(category);
  return inCategory.filter((m) => m.slug !== slug).slice(0, limit);
}
