import type { Route, RouteFilterId } from "@/lib/data/routes";

export type ExperienceKind = "route" | "excursion";

export type ExperienceFilterId =
  | RouteFilterId
  | "self-guided"
  | "guided"
  | "corporate";

export interface ExperienceBadge {
  label: string;
  variant?: "default" | "baikal" | "amber" | "outline";
}

export interface ExperienceItem {
  id: string;
  kind: ExperienceKind;
  slug: string;
  title: string;
  description: string;
  href: string;
  cover?: string;
  priceLabel?: string;
  duration?: number;
  distance?: number;
  pointsCount?: number;
  badges: ExperienceBadge[];
  filters: ExperienceFilterId[];
  hasGeo: boolean;
  isSelfGuided: boolean;
  isGuidedAvailable: boolean;
  isCorporateAvailable: boolean;
  /** For lead forms — route slug when kind is route */
  routeSlug?: string;
  /** Map layer id (routes only) */
  mapRouteId?: string;
  /** For lead forms — excursion slug when kind is excursion */
  excursionSlug?: string;
  bookingCta?: string;
  bookingDescription?: string;
}

export const EXPERIENCE_FILTERS: Array<{ id: ExperienceFilterId; label: string }> = [
  { id: "all", label: "Все" },
  { id: "free", label: "Бесплатные" },
  { id: "paid", label: "Платные" },
  { id: "self-guided", label: "Самостоятельно" },
  { id: "guided", label: "С гидом" },
  { id: "corporate", label: "Корпоратив" },
  { id: "walking", label: "Пешие" },
  { id: "1-2h", label: "1–2 ч" },
  { id: "half-day", label: "Полдня" },
  { id: "first-visit", label: "Первое знакомство" },
  { id: "architecture", label: "Архитектура" },
  { id: "history", label: "История" },
  { id: "gastro", label: "Гастро" },
  { id: "baikal-nearby", label: "Байкал рядом" },
  { id: "locals", label: "Для местных" },
];

const VALID_FILTER_IDS = new Set(EXPERIENCE_FILTERS.map((f) => f.id));

export function isExperienceFilterId(value: string): value is ExperienceFilterId {
  return VALID_FILTER_IDS.has(value as ExperienceFilterId);
}

export function filterExperiences(
  items: ExperienceItem[],
  filterId: ExperienceFilterId
): ExperienceItem[] {
  if (filterId === "all") return items;

  if (filterId === "self-guided") {
    return items.filter((item) => item.isSelfGuided);
  }
  if (filterId === "guided") {
    return items.filter((item) => item.isGuidedAvailable || item.kind === "excursion");
  }
  if (filterId === "corporate") {
    return items.filter((item) => item.isCorporateAvailable);
  }

  return items.filter((item) => item.filters.includes(filterId));
}

export function buildRouteExperienceFilters(route: Route): ExperienceFilterId[] {
  const set = new Set<ExperienceFilterId>(route.filters);

  if (route.isSelfGuided !== false) set.add("self-guided");
  if (route.isGuidedAvailable !== false) set.add("guided");
  if (route.isCorporateAvailable) set.add("corporate");

  return [...set];
}
