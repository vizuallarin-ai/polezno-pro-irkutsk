import type { MetadataRoute } from "next";
import { DEMO_EXPLORE_MATERIALS } from "@/lib/data/explore-materials";
import { EXPLORE_CATEGORIES } from "@/lib/explore-constants";
import { getRoutesForMap } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site-url";
import {
  ARTICLE_PUBLISHED_WHERE,
  AR_POSTCARD_PUBLISHED_WHERE,
  MAKER_PUBLISHED_WHERE,
  PHOTO_PUBLISHED_WHERE,
  PUBLISHED_STATUS_WHERE,
} from "@/lib/cms-filters";
import { isSitemapEligible } from "@/lib/content-readiness";
import { logSitemapCmsError } from "@/lib/sitemap-contract";

const BASE_URL = getSiteUrl();

function eligibleDoc(
  kind:
    | "article"
    | "event"
    | "product"
    | "maker"
    | "route"
    | "excursion"
    | "photo"
    | "ar_postcard",
  doc: { status?: string | null; _status?: string | null; title?: string | null; slug?: string | null; name?: string | null; moderationStatus?: string | null; placementStatus?: string | null; shortDescription?: string | null }
): boolean {
  return isSitemapEligible({
    kind,
    status: doc.status ?? "published",
    _status: doc._status,
    title: doc.title ?? doc.name,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    moderationStatus: doc.moderationStatus,
    placementStatus: doc.placementStatus,
  });
}

async function getCmsUrls() {
  if (!process.env.DATABASE_URL) return [];

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const [articles, events, products, makersRes, routesRes, excursionsRes, photosRes, arPostcardsRes] =
      await Promise.all([
      payload.find({
        collection: "articles",
        where: ARTICLE_PUBLISHED_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "events",
        where: PUBLISHED_STATUS_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "products",
        where: PUBLISHED_STATUS_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "makers",
        where: MAKER_PUBLISHED_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "routes",
        where: PUBLISHED_STATUS_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "excursions",
        where: PUBLISHED_STATUS_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "photos",
        where: PHOTO_PUBLISHED_WHERE,
        limit: 1000,
        depth: 0,
      }),
      payload.find({
        collection: "ar-postcards",
        where: AR_POSTCARD_PUBLISHED_WHERE,
        limit: 1000,
        depth: 0,
      }),
    ]);

    const articleUrls = articles.docs
      .filter((a) =>
        eligibleDoc("article", a as { status?: string; _status?: string; title?: string; slug?: string })
      )
      .map((a) => ({
      url: `${BASE_URL}/explore/${a.slug}`,
      lastModified: new Date(String(a.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const eventUrls = events.docs
      .filter((e) =>
        eligibleDoc("event", e as { status?: string; title?: string; slug?: string })
      )
      .map((e) => ({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: new Date(String(e.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const productUrls = products.docs
      .filter((p) =>
        eligibleDoc("product", p as { status?: string; title?: string; slug?: string })
      )
      .map((p) => ({
      url: `${BASE_URL}/souvenirs/${p.slug}`,
      lastModified: new Date(String(p.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const makerUrls = makersRes.docs
      .filter((m) =>
        eligibleDoc("maker", {
          ...(m as { status?: string; name?: string; slug?: string; placementStatus?: string }),
          title: (m as { name?: string }).name,
        })
      )
      .map((m) => ({
      url: `${BASE_URL}/souvenirs/makers/${m.slug}`,
      lastModified: new Date(String(m.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    }));

    const cmsRouteUrls = routesRes.docs
      .filter((r) =>
        eligibleDoc("route", r as { status?: string; title?: string; slug?: string })
      )
      .map((r) => ({
      url: `${BASE_URL}/map/${r.slug}`,
      lastModified: new Date(String(r.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));

    const excursionUrls = excursionsRes.docs
      .filter((e) =>
        eligibleDoc("excursion", e as { status?: string; title?: string; slug?: string; shortDescription?: string })
      )
      .map((e) => ({
      url: `${BASE_URL}/excursions/${e.slug}`,
      lastModified: new Date(String(e.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    const photoUrls = photosRes.docs
      .filter((p) =>
        eligibleDoc("photo", p as { status?: string; title?: string; slug?: string; moderationStatus?: string })
      )
      .map((p) => ({
      url: `${BASE_URL}/explore/photos/${p.slug}`,
      lastModified: new Date(String(p.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

    const arPostcardUrls = arPostcardsRes.docs
      .filter((p) =>
        eligibleDoc("ar_postcard", p as { status?: string; title?: string; slug?: string })
      )
      .map((p) => ({
      url: `${BASE_URL}/ar-postcards/${p.slug}`,
      lastModified: new Date(String(p.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [
      ...articleUrls,
      ...eventUrls,
      ...productUrls,
      ...makerUrls,
      ...cmsRouteUrls,
      ...excursionUrls,
      ...photoUrls,
      ...arPostcardUrls,
    ];
  } catch (error) {
    logSitemapCmsError(error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const exploreCategoryUrls = EXPLORE_CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/explore/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const staticPageDefs = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/map`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/explore`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/explore/photos`, priority: 0.85, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/events`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/souvenirs`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/ar-postcards`, priority: 0.75, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/about/guides`, priority: 0.55, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/business`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" as const },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  const staticPages = staticPageDefs;

  const cmsUrls = await getCmsUrls();

  if (cmsUrls.length > 0) {
    return [...staticPages, ...exploreCategoryUrls, ...cmsUrls];
  }

  // На production с БД — только статика, без demo-URL в sitemap
  if (process.env.DATABASE_URL) {
    return [...staticPages, ...exploreCategoryUrls];
  }

  const demoArticleUrls = DEMO_EXPLORE_MATERIALS.map((m) => ({
    url: `${BASE_URL}/explore/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const { routes } = await getRoutesForMap();
  const demoRouteUrls = routes.map((r) => ({
    url: `${BASE_URL}/map/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    ...staticPages,
    ...exploreCategoryUrls,
    ...demoArticleUrls,
    ...demoRouteUrls,
  ];
}
