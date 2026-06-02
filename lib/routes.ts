import { DEMO_ROUTES, type Route } from "@/lib/data/routes";
import { routeToMapRoute } from "@/lib/route-adapters";
import type { MapRoute } from "@/types/map";

export { routeToMapRoute } from "@/lib/route-adapters";

export function getAllDemoRoutes(): Route[] {
  return DEMO_ROUTES;
}

export function getDemoRouteBySlug(slug: string): Route | undefined {
  return DEMO_ROUTES.find((r) => r.slug === slug);
}

export function getSimilarRoutes(slug: string, limit = 3): Route[] {
  const current = getDemoRouteBySlug(slug);
  if (!current) return DEMO_ROUTES.slice(0, limit);
  return DEMO_ROUTES.filter((r) => r.slug !== slug)
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

/** Demo routes merged with CMS when available; demo always included as base. */
export async function getRoutesForMap(): Promise<{
  routes: Route[];
  mapRoutes: MapRoute[];
}> {
  const demo = getAllDemoRoutes();
  let cmsRoutes: MapRoute[] = [];

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "routes",
      limit: 100,
      depth: 2,
    });
    cmsRoutes = result.docs as unknown as MapRoute[];
  } catch {
    cmsRoutes = [];
  }

  const demoSlugs = new Set(demo.map((r) => r.slug));
  const cmsOnly = cmsRoutes.filter((r) => !demoSlugs.has(r.slug));

  const mapRoutes = [
    ...demo.map(routeToMapRoute),
    ...cmsOnly.filter((r) => r.geoLine?.coordinates?.length),
  ];

  return { routes: demo, mapRoutes };
}

export async function getRoutePageData(slug: string): Promise<{
  route: Route | null;
  similar: Route[];
}> {
  const demo = getDemoRouteBySlug(slug);
  if (demo) {
    return { route: demo, similar: getSimilarRoutes(slug) };
  }

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "routes",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    const doc = result.docs[0] as unknown as MapRoute | undefined;
    if (!doc) return { route: null, similar: getSimilarRoutes(slug) };

    const route: Route = {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      fullDescription: doc.description,
      format: "walking",
      mapCategory: doc.category,
      type: doc.type,
      price: doc.price,
      duration: doc.duration ?? 90,
      distance: doc.distance ?? 3,
      pointsCount: doc.places?.length ?? 0,
      difficulty: "medium",
      tags: [],
      filters: [doc.type],
      coverImage: doc.cover?.url,
      routeLine: (doc.geoLine?.coordinates as [number, number][]) ?? [],
      points:
        doc.places?.map((p, i) => ({
          id: p.id,
          order: i + 1,
          title: p.title,
          description: p.description ?? "",
          whatToNotice: "",
          coordinates: p.coordinates,
        })) ?? [],
    };

    return { route, similar: getSimilarRoutes(slug) };
  } catch {
    return { route: null, similar: getSimilarRoutes(slug) };
  }
}
