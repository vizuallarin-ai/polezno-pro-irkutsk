import type { Route } from "@/lib/data/routes";
import type { MapRoute } from "@/types/map";

export function routeToMapRoute(route: Route): MapRoute {
  return {
    id: route.id,
    slug: route.slug,
    title: route.title,
    category: route.mapCategory,
    type: route.type,
    price: route.price,
    duration: route.duration,
    distance: route.distance,
    description: route.description,
    cover: route.coverImage
      ? { url: route.coverImage, alt: route.title }
      : undefined,
    geoLine: {
      type: "LineString",
      coordinates: route.routeLine,
    },
    places: route.points.map((p) => ({
      id: p.id,
      title: p.title,
      coordinates: p.coordinates,
      category: route.title,
      isLocalGem: route.filters.includes("locals"),
      description: p.description,
    })),
  };
}
