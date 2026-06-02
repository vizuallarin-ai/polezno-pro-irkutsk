import type { MetadataRoute } from "next";
import { DEMO_ROUTES } from "@/lib/data/routes";

const BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://polezno.irkutsk.ru";

const demoRouteUrls = DEMO_ROUTES.map((r) => ({
  url: `${BASE_URL}/map/${r.slug}`,
  lastModified: new Date(),
  changeFrequency: "monthly" as const,
  priority: 0.85,
}));

async function getCmsUrls() {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const [articles, events, products, routes] = await Promise.all([
      payload.find({ collection: "articles", limit: 1000, depth: 0 }),
      payload.find({ collection: "events", limit: 1000, depth: 0 }),
      payload.find({ collection: "products", limit: 1000, depth: 0 }),
      payload.find({ collection: "routes", limit: 1000, depth: 0 }),
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

    const cmsRouteUrls = routes.docs
      .filter((r) => !DEMO_ROUTES.some((d) => d.slug === r.slug))
      .map((r) => ({
        url: `${BASE_URL}/map/${r.slug}`,
        lastModified: new Date(String(r.updatedAt)),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

    return [...articleUrls, ...eventUrls, ...productUrls, ...cmsRouteUrls];
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
    { url: `${BASE_URL}/program`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  const cmsUrls = await getCmsUrls();

  return [...staticPages, ...demoRouteUrls, ...cmsUrls];
}
