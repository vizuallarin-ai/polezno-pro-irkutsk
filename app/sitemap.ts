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
import {
  commercialInputFromDoc,
  isSitemapEligible,
  type CommercialKind,
} from "@/lib/content-readiness";
import { logSitemapCmsError } from "@/lib/sitemap-contract";

const BASE_URL = getSiteUrl();

type SitemapEntry = MetadataRoute.Sitemap[number];

function eligibleDoc(
  kind: Extract<
    CommercialKind,
    | "article"
    | "event"
    | "product"
    | "maker"
    | "route"
    | "excursion"
    | "photo"
    | "ar_postcard"
  >,
  doc: Record<string, unknown>
): boolean {
  return isSitemapEligible(commercialInputFromDoc(kind, doc));
}

function entry(
  path: string,
  opts?: {
    lastModified?: Date | string | null;
    changeFrequency?: SitemapEntry["changeFrequency"];
    priority?: number;
  }
): SitemapEntry {
  const lastModified =
    opts?.lastModified != null && opts.lastModified !== ""
      ? new Date(opts.lastModified)
      : undefined;

  return {
    url: path === "/" ? BASE_URL : `${BASE_URL}${path}`,
    ...(lastModified && !Number.isNaN(lastModified.getTime())
      ? { lastModified }
      : {}),
    ...(opts?.changeFrequency ? { changeFrequency: opts.changeFrequency } : {}),
    ...(opts?.priority != null ? { priority: opts.priority } : {}),
  };
}

type CmsSitemapResult = {
  urls: SitemapEntry[];
  counts: {
    articles: number;
    events: number;
    products: number;
    makers: number;
    routes: number;
    excursions: number;
    photos: number;
    arPostcards: number;
  };
};

async function getCmsSitemap(): Promise<CmsSitemapResult> {
  const empty: CmsSitemapResult = {
    urls: [],
    counts: {
      articles: 0,
      events: 0,
      products: 0,
      makers: 0,
      routes: 0,
      excursions: 0,
      photos: 0,
      arPostcards: 0,
    },
  };

  if (!process.env.DATABASE_URL) return empty;

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const [
      articles,
      events,
      products,
      makersRes,
      routesRes,
      excursionsRes,
      photosRes,
      arPostcardsRes,
    ] = await Promise.all([
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
        depth: 1,
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
        depth: 1,
      }),
      payload.find({
        collection: "ar-postcards",
        where: AR_POSTCARD_PUBLISHED_WHERE,
        limit: 1000,
        depth: 1,
      }),
    ]);

    const articleDocs = articles.docs.filter((a) =>
      eligibleDoc("article", a as Record<string, unknown>)
    );
    const eventDocs = events.docs.filter((e) =>
      eligibleDoc("event", e as Record<string, unknown>)
    );
    const productDocs = products.docs.filter((p) =>
      eligibleDoc("product", p as Record<string, unknown>)
    );
    const makerDocs = makersRes.docs.filter((m) =>
      eligibleDoc("maker", m as Record<string, unknown>)
    );
    const routeDocs = routesRes.docs.filter((r) =>
      eligibleDoc("route", r as Record<string, unknown>)
    );
    const excursionDocs = excursionsRes.docs.filter((e) =>
      eligibleDoc("excursion", e as Record<string, unknown>)
    );
    const photoDocs = photosRes.docs.filter((p) => {
      if (!eligibleDoc("photo", p as Record<string, unknown>)) return false;
      const raw = p as Record<string, unknown>;
      const description =
        typeof raw.description === "string" ? raw.description.trim() : "";
      // Thin image-only photo pages stay out of the sitemap.
      return description.length > 0;
    });
    const arDocs = arPostcardsRes.docs.filter((p) =>
      eligibleDoc("ar_postcard", p as Record<string, unknown>)
    );

    const urls: SitemapEntry[] = [
      ...articleDocs.map((a) =>
        entry(`/explore/${a.slug}`, {
          lastModified: a.updatedAt ? String(a.updatedAt) : null,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      ),
      ...eventDocs.map((e) =>
        entry(`/events/${e.slug}`, {
          lastModified: e.updatedAt ? String(e.updatedAt) : null,
          changeFrequency: "weekly",
          priority: 0.6,
        })
      ),
      ...productDocs.map((p) =>
        entry(`/souvenirs/${p.slug}`, {
          lastModified: p.updatedAt ? String(p.updatedAt) : null,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      ),
      ...makerDocs.map((m) =>
        entry(`/souvenirs/makers/${m.slug}`, {
          lastModified: m.updatedAt ? String(m.updatedAt) : null,
          changeFrequency: "monthly",
          priority: 0.55,
        })
      ),
      ...routeDocs.map((r) =>
        entry(`/map/${r.slug}`, {
          lastModified: r.updatedAt ? String(r.updatedAt) : null,
          changeFrequency: "monthly",
          priority: 0.85,
        })
      ),
      ...excursionDocs.map((e) =>
        entry(`/excursions/${e.slug}`, {
          lastModified: e.updatedAt ? String(e.updatedAt) : null,
          changeFrequency: "weekly",
          priority: 0.75,
        })
      ),
      ...photoDocs.map((p) =>
        entry(`/explore/photos/${p.slug}`, {
          lastModified: p.updatedAt ? String(p.updatedAt) : null,
          changeFrequency: "monthly",
          priority: 0.55,
        })
      ),
      ...arDocs.map((p) =>
        entry(`/ar-postcards/${p.slug}`, {
          lastModified: p.updatedAt ? String(p.updatedAt) : null,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      ),
    ];

    return {
      urls,
      counts: {
        articles: articleDocs.length,
        events: eventDocs.length,
        products: productDocs.length,
        makers: makerDocs.length,
        routes: routeDocs.length,
        excursions: excursionDocs.length,
        photos: photoDocs.length,
        arPostcards: arDocs.length,
      },
    };
  } catch (error) {
    logSitemapCmsError(error);
    return empty;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cms = await getCmsSitemap();

  const coreStatic: SitemapEntry[] = [
    entry("/", { changeFrequency: "daily", priority: 1.0 }),
    entry("/map", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/explore", { changeFrequency: "daily", priority: 0.9 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/business", { changeFrequency: "monthly", priority: 0.9 }),
    entry("/contact", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/privacy", { changeFrequency: "yearly", priority: 0.3 }),
  ];

  const exploreCategoryUrls = EXPLORE_CATEGORIES.map((cat) =>
    entry(`/explore/${cat.slug}`, {
      changeFrequency: "weekly",
      priority: 0.75,
    })
  );

  /** Empty CMS shelves stay reachable but out of the sitemap until they have content. */
  const conditionalSections: SitemapEntry[] = [];
  if (cms.counts.photos > 0) {
    conditionalSections.push(
      entry("/explore/photos", { changeFrequency: "weekly", priority: 0.85 })
    );
  }
  if (cms.counts.events > 0) {
    conditionalSections.push(
      entry("/events", { changeFrequency: "daily", priority: 0.8 })
    );
  }
  if (cms.counts.products > 0 || cms.counts.makers > 0) {
    conditionalSections.push(
      entry("/souvenirs", { changeFrequency: "weekly", priority: 0.8 })
    );
  }
  if (cms.counts.arPostcards > 0) {
    conditionalSections.push(
      entry("/ar-postcards", { changeFrequency: "weekly", priority: 0.75 })
    );
  }

  if (cms.urls.length > 0 || process.env.DATABASE_URL) {
    return [
      ...coreStatic,
      ...conditionalSections,
      ...exploreCategoryUrls,
      ...cms.urls,
    ];
  }

  // Local/dev without DB: demo corpus only (production fail-closed via DATABASE_URL branch above).
  const demoArticleUrls = DEMO_EXPLORE_MATERIALS.map((m) =>
    entry(`/explore/${m.slug}`, { changeFrequency: "weekly", priority: 0.7 })
  );

  const { routes } = await getRoutesForMap();
  const demoRouteUrls = routes.map((r) =>
    entry(`/map/${r.slug}`, { changeFrequency: "monthly", priority: 0.85 })
  );

  return [
    ...coreStatic,
    ...exploreCategoryUrls,
    ...demoArticleUrls,
    ...demoRouteUrls,
  ];
}
