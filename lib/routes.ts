import { DEMO_ROUTES, type Route } from "@/lib/data/routes";
import { PUBLISHED_STATUS_WHERE } from "@/lib/cms-filters";
import {
  payloadRouteToRoute,
  isPublishedRoute,
} from "@/lib/payload-route-adapter";
import { routeToMapRoute } from "@/lib/route-adapters";
import type { MapRoute } from "@/types/map";

export { routeToMapRoute } from "@/lib/route-adapters";

export function getAllDemoRoutes(): Route[] {
  return DEMO_ROUTES;
}

export function getDemoRouteBySlug(slug: string): Route | undefined {
  return DEMO_ROUTES.find((r) => r.slug === slug);
}

export function getSimilarRoutes(slug: string, limit = 3, pool?: Route[]): Route[] {
  const source = pool ?? getAllDemoRoutes();
  const current = source.find((r) => r.slug === slug) ?? getDemoRouteBySlug(slug);
  if (!current) return source.slice(0, limit);
  return source
    .filter((r) => r.slug !== slug)
    .sort((a, b) => {
      const aScore =
        (a.mapCategory === current.mapCategory ? 2 : 0) +
        (a.type === current.type ? 1 : 0);
      const bScore =
        (b.mapCategory === current.mapCategory ? 2 : 0) +
        (b.type === current.type ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

async function getPayloadSafe() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    return await getPayloadClient();
  } catch {
    return null;
  }
}

async function cmsHasAnyRoutes(): Promise<boolean> {
  const payload = await getPayloadSafe();
  if (!payload) return false;
  try {
    const count = await payload.count({ collection: "routes" });
    return count.totalDocs > 0;
  } catch {
    return false;
  }
}

async function fetchPublishedCmsRoutes(): Promise<Route[]> {
  const payload = await getPayloadSafe();
  if (!payload) return [];

  try {
    const result = await payload.find({
      collection: "routes",
      where: PUBLISHED_STATUS_WHERE,
      limit: 200,
      depth: 2,
      sort: "title",
    });

    return result.docs
      .filter((doc) => isPublishedRoute(doc as { status?: string }))
      .map((doc) => payloadRouteToRoute(doc as Parameters<typeof payloadRouteToRoute>[0]));
  } catch {
    return [];
  }
}

/** CMS-маршруты при наличии, иначе демо-данные. */
export async function getRoutesForMap(): Promise<{
  routes: Route[];
  mapRoutes: MapRoute[];
  source: "cms" | "demo";
}> {
  const cmsRoutes = await fetchPublishedCmsRoutes();

  if (cmsRoutes.length > 0) {
    const mapRoutes = cmsRoutes
      .map(routeToMapRoute)
      .filter((r) => r.geoLine?.coordinates?.length);
    return { routes: cmsRoutes, mapRoutes, source: "cms" };
  }

  const hasCmsData = await cmsHasAnyRoutes();
  if (hasCmsData) {
    return { routes: [], mapRoutes: [], source: "cms" };
  }

  const demo = getAllDemoRoutes();
  return {
    routes: demo,
    mapRoutes: demo.map(routeToMapRoute),
    source: "demo",
  };
}

export async function getRoutePageData(slug: string): Promise<{
  route: Route | null;
  similar: Route[];
  source: "cms" | "demo" | null;
}> {
  const payload = await getPayloadSafe();

  if (payload) {
    const hasCmsData = await cmsHasAnyRoutes();

    if (hasCmsData) {
      try {
        const result = await payload.find({
          collection: "routes",
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 2,
        });

        const doc = result.docs[0] as Parameters<typeof payloadRouteToRoute>[0] | undefined;

        if (!doc || !isPublishedRoute(doc)) {
          const published = await fetchPublishedCmsRoutes();
          return {
            route: null,
            similar: getSimilarRoutes(slug, 3, published),
            source: "cms",
          };
        }

        const route = payloadRouteToRoute(doc);
        const published = await fetchPublishedCmsRoutes();
        return {
          route,
          similar: getSimilarRoutes(slug, 3, published),
          source: "cms",
        };
      } catch {
        return { route: null, similar: [], source: "cms" };
      }
    }
  }

  const demo = getDemoRouteBySlug(slug);
  if (demo) {
    return { route: demo, similar: getSimilarRoutes(slug), source: "demo" };
  }

  return { route: null, similar: getSimilarRoutes(slug), source: null };
}
