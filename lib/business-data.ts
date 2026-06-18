import { ARTICLE_PUBLISHED_WHERE } from "@/lib/cms-filters";
import type { Route } from "@/lib/data/routes";
import type { ExploreMaterialView } from "@/lib/explore";
import { getExploreMaterialsByCategory } from "@/lib/explore";
import { getRoutesForMap } from "@/lib/routes";

export async function getCorporateRoutes(limit = 4): Promise<Route[]> {
  const { routes } = await getRoutesForMap();
  const corporate = routes.filter((r) => r.isCorporateAvailable);
  return corporate.slice(0, limit);
}

export async function getBusinessArticles(
  limit = 3
): Promise<ExploreMaterialView[]> {
  const articles = await getExploreMaterialsByCategory("business");
  return articles.slice(0, limit);
}

export async function getBusinessPageData() {
  const [corporateRoutes, businessArticles] = await Promise.all([
    getCorporateRoutes(4),
    getBusinessArticles(3),
  ]);

  return { corporateRoutes, businessArticles };
}

export async function getBusinessArticleCount(): Promise<number> {
  if (!process.env.DATABASE_URL) {
    const articles = await getExploreMaterialsByCategory("business");
    return articles.length;
  }

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      where: {
        and: [
          { category: { equals: "business" } },
          ARTICLE_PUBLISHED_WHERE,
        ],
      },
      limit: 1,
    });
    return result.totalDocs;
  } catch {
    const articles = await getExploreMaterialsByCategory("business");
    return articles.length;
  }
}
