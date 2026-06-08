/** Группы бокового меню Payload (фаза 3B). */
export const ADMIN_GROUPS = {
  routes: "Маршруты",
  leads: "Заявки",
  articles: "Статьи",
  events: "События",
  excursions: "Экскурсии",
  products: "Магазин",
  settings: "Настройки",
  later: "Позже",
} as const;

export const CONTENT_STATUS_OPTIONS = [
  { label: "Черновик", value: "draft" },
  { label: "Опубликован", value: "published" },
  { label: "Скрыт", value: "hidden" },
  { label: "В архиве", value: "archived" },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { label: "Главная", value: "home" },
  { label: "Форма программы", value: "program" },
  { label: "Страница контактов", value: "contacts" },
  { label: "Boosty", value: "boosty" },
  { label: "Маршрут / карта", value: "route" },
  { label: "Статья", value: "article" },
  { label: "Событие", value: "event" },
  { label: "Экскурсия", value: "excursion" },
  { label: "Товар / магазин", value: "product" },
  { label: "Экскурсии (раздел)", value: "excursions" },
  { label: "Магазин (раздел)", value: "shop" },
  { label: "Карта (legacy)", value: "map" },
  { label: "Прямой заход", value: "direct" },
  { label: "Другое", value: "other" },
] as const;

export const LEAD_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_SOURCE_OPTIONS.map((o) => [o.value, o.label])
);
