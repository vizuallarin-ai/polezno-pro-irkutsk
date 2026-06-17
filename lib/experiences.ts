import type { Route } from "@/lib/data/routes";
import { ROUTE_FORMAT_LABELS } from "@/lib/data/routes";
import {
  buildRouteExperienceFilters,
  type ExperienceBadge,
  type ExperienceFilterId,
  type ExperienceItem,
} from "@/lib/data/experiences";
import { getRoutesForMap } from "@/lib/routes";
import {
  EXCURSION_FORMAT_LABELS,
  type ExcursionDoc,
  excursionCoverUrl,
  getPublishedExcursions,
} from "@/lib/excursions";
import type { MapRoute } from "@/types/map";

function routePriceLabel(route: Route): string | undefined {
  if (route.priceLabel) return route.priceLabel;
  if (route.type === "free") return "Бесплатно";
  if (route.price != null && route.price > 0) {
    return `от ${route.price.toLocaleString("ru-RU")} ₽`;
  }
  return route.type === "paid" ? "Платный" : undefined;
}

function routeBadges(route: Route): ExperienceBadge[] {
  const badges: ExperienceBadge[] = [
    {
      label: route.type === "free" ? "Бесплатно" : "Платный",
      variant: route.type === "free" ? "baikal" : "amber",
    },
    { label: ROUTE_FORMAT_LABELS[route.format], variant: "outline" },
  ];
  if (route.isSelfGuided !== false) {
    badges.push({ label: "Самостоятельно", variant: "outline" });
  }
  if (route.isGuidedAvailable !== false) {
    badges.push({ label: "С гидом", variant: "outline" });
  }
  if (route.isCorporateAvailable) {
    badges.push({ label: "Корпоратив", variant: "outline" });
  }
  return badges;
}

export function routeToExperience(route: Route): ExperienceItem {
  return {
    id: `route-${route.id}`,
    kind: "route",
    slug: route.slug,
    title: route.title,
    description: route.description,
    href: `/map/${route.slug}`,
    cover: route.coverImage,
    priceLabel: routePriceLabel(route),
    duration: route.duration,
    distance: route.distance,
    pointsCount: route.pointsCount,
    badges: routeBadges(route),
    filters: buildRouteExperienceFilters(route),
    hasGeo: route.routeLine.length > 0,
    isSelfGuided: route.isSelfGuided !== false,
    isGuidedAvailable: route.isGuidedAvailable !== false,
    isCorporateAvailable: Boolean(route.isCorporateAvailable),
    routeSlug: route.slug,
    mapRouteId: route.id,
    bookingCta: route.bookingCta,
    bookingDescription: route.bookingDescription,
  };
}

function excursionFilters(excursion: ExcursionDoc): ExperienceFilterId[] {
  const filters = new Set<ExperienceFilterId>(["guided"]);

  if (excursion.format === "corporate") filters.add("corporate");
  if (excursion.format === "walking") filters.add("walking");
  if (excursion.format === "gastro") filters.add("gastro");
  if (excursion.format === "baikal") filters.add("baikal-nearby");

  const duration = excursion.duration ?? 0;
  if (duration > 0 && duration <= 150) filters.add("1-2h");
  if (duration >= 240) filters.add("half-day");

  if (
    !excursion.priceOnRequest &&
    excursion.price != null &&
    excursion.price > 0
  ) {
    filters.add("paid");
  } else if (!excursion.priceOnRequest && excursion.price === 0) {
    filters.add("free");
  }

  return [...filters];
}

function excursionPriceLabel(excursion: ExcursionDoc): string | undefined {
  if (excursion.priceOnRequest) return "По запросу";
  if (excursion.price != null && excursion.price > 0) {
    return `от ${excursion.price.toLocaleString("ru-RU")} ₽`;
  }
  return "По запросу";
}

function excursionBadges(excursion: ExcursionDoc): ExperienceBadge[] {
  const badges: ExperienceBadge[] = [
    { label: "С Алёной", variant: "baikal" },
    {
      label:
        EXCURSION_FORMAT_LABELS[excursion.format] || excursion.format,
      variant: "outline",
    },
  ];
  if (excursion.format === "corporate") {
    badges.push({ label: "Корпоратив", variant: "outline" });
  }
  return badges;
}

export function excursionToExperience(excursion: ExcursionDoc): ExperienceItem {
  return {
    id: `excursion-${excursion.id}`,
    kind: "excursion",
    slug: excursion.slug,
    title: excursion.title,
    description: excursion.shortDescription,
    href: `/excursions/${excursion.slug}`,
    cover: excursionCoverUrl(excursion),
    priceLabel: excursionPriceLabel(excursion),
    duration: excursion.duration ?? undefined,
    badges: excursionBadges(excursion),
    filters: excursionFilters(excursion),
    hasGeo: false,
    isSelfGuided: false,
    isGuidedAvailable: true,
    isCorporateAvailable: excursion.format === "corporate",
    excursionSlug: excursion.slug,
  };
}

export async function getExcursionsForCatalog(): Promise<ExcursionDoc[]> {
  const all = await getPublishedExcursions();
  return all.filter((e) => e.showInRoutesPage !== false);
}

export async function getExperienceCatalog(): Promise<{
  experiences: ExperienceItem[];
  mapRoutes: MapRoute[];
  source: "cms" | "demo";
}> {
  const { routes, mapRoutes, source } = await getRoutesForMap();
  const excursions = await getExcursionsForCatalog();

  const experiences: ExperienceItem[] = [
    ...routes.map(routeToExperience),
    ...excursions.map(excursionToExperience),
  ];

  return { experiences, mapRoutes, source };
}
