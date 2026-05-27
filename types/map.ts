export type RouteCategory =
  | "architecture"
  | "gastronomy"
  | "history"
  | "decembrists"
  | "wooden"
  | "hidden"
  | "soviet"
  | "night";

export const ROUTE_CATEGORY_LABELS: Record<RouteCategory, string> = {
  architecture: "Архитектура",
  gastronomy: "Гастрономия",
  history: "История",
  decembrists: "Декабристы",
  wooden: "Деревянное зодчество",
  hidden: "Hidden Places",
  soviet: "Советский Иркутск",
  night: "Ночная прогулка",
};

export const ROUTE_CATEGORY_COLORS: Record<RouteCategory, string> = {
  architecture: "#0B3D5C",
  gastronomy: "#C47A2E",
  history: "#4A4A5A",
  decembrists: "#2C5F4A",
  wooden: "#7A4A2E",
  hidden: "#4A2E7A",
  soviet: "#7A2E2E",
  night: "#1A1A2E",
};

export interface MapPlace {
  id: string;
  title: string;
  coordinates: { lat: number; lng: number };
  category: string;
  isLocalGem: boolean;
  description?: string;
  photos?: Array<{ image: { url: string; alt?: string } }>;
}

export interface RouteScheduleItem {
  date: string;
  time?: string;
  spotsTotal?: number;
  spotsLeft?: number;
  isOpen?: boolean;
}

export interface MapRoute {
  id: string;
  title: string;
  slug: string;
  category: RouteCategory;
  type: "free" | "paid";
  price?: number;
  duration?: number;
  distance?: number;
  description: string;
  cover?: { url: string; alt?: string };
  geoLine?: GeoJSON.LineString;
  places?: MapPlace[];
  audioGuide?: { url: string };
  pdfGuide?: { url: string };
  stripeProductId?: string;
  schedule?: RouteScheduleItem[];
  qrCodeUrl?: string;
  guide?: { name: string; photo?: { url?: string } };
}
