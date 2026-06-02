import type { MetadataRoute } from "next";
import { getRoutesForMap } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site-url";
import {
  ARTICLE_PUBLISHED_WHERE,
  PUBLISHED_STATUS_WHERE,
} from "@/lib/cms-filters";

const BASE_URL = getSiteUrl();

async function getCmsUrls() {
  if (!process.env.DATABASE_URL) return [];

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const [articles, events, products, routesRes, excursionsRes] =
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
    ]);

    const articleUrls = articles.docs.map((a) => ({
      url: `${BASE_URL}/explore/${a.slug}`,
      lastModified: new Date(String(a.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const eventUrls = events.docs.map((e) => ({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: new Date(String(e.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const productUrls = products.docs.map((p) => ({
      url: `${BASE_URL}/shop/${p.slug}`,
      lastModified: new Date(String(p.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const cmsRouteUrls = routesRes.docs.map((r) => ({
      url: `${BASE_URL}/map/${r.slug}`,
      lastModified: new Date(String(r.updatedAt)),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));

    const excursionUrls = excursionsRes.docs.map((e) => ({
      url: `${BASE_URL}/excursions/${e.slug}`,
      lastModified: new Date(String(e.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    return [
      ...articleUrls,
      ...eventUrls,
      ...productUrls,
      ...cmsRouteUrls,
      ...excursionUrls,
    ];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/map`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/explore`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/events`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/shop`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/excursions`, priority: 0.85, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/program`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  const cmsUrls = await getCmsUrls();

  if (cmsUrls.length > 0) {
    return [...staticPages, ...cmsUrls];
  }

  const { routes } = await getRoutesForMap();
  const demoRouteUrls = routes.map((r) => ({
    url: `${BASE_URL}/map/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...demoRouteUrls];
}
