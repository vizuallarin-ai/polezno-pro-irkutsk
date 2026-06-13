/** Группы бокового меню Payload. */
export const ADMIN_GROUPS = {
  routes: "Маршруты",
  leads: "Заявки",
  articles: "Статьи",
  events: "События",
  excursions: "Экскурсии",
  products: "Магазин",
  media: "Медиа",
  settings: "Настройки",
  later: "Позже",
} as const;

export {
  ARTICLE_CATEGORY_OPTIONS,
  CONTENT_STATUS_OPTIONS,
  EVENT_CATEGORY_OPTIONS,
  EXCURSION_FORMAT_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_SOURCE_LABELS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STOCK_OPTIONS,
  ROUTE_ACCESS_OPTIONS,
  ROUTE_CATEGORY_OPTIONS,
  ROUTE_DIFFICULTY_OPTIONS,
  ROUTE_FORMAT_OPTIONS,
} from "../lib/content-labels";
