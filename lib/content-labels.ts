/** Единые подписи рубрик/статусов — CMS и публичный сайт. */

export type SelectOption = { label: string; value: string };

function labelsFromOptions(options: readonly SelectOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

export const CONTENT_STATUS_OPTIONS = [
  { label: "Черновик", value: "draft" },
  { label: "Опубликован", value: "published" },
  { label: "Скрыт", value: "hidden" },
  { label: "В архиве", value: "archived" },
] as const satisfies readonly SelectOption[];

export const ROUTE_CATEGORY_OPTIONS = [
  { label: "Архитектура", value: "architecture" },
  { label: "Гастрономия", value: "gastronomy" },
  { label: "История", value: "history" },
  { label: "Декабристы", value: "decembrists" },
  { label: "Деревянное зодчество", value: "wooden" },
  { label: "Секретные места", value: "hidden" },
  { label: "Советский Иркутск", value: "soviet" },
  { label: "Ночная прогулка", value: "night" },
] as const satisfies readonly SelectOption[];

export const ROUTE_FORMAT_OPTIONS = [
  { label: "Пеший", value: "walking" },
  { label: "Гастро", value: "gastro" },
  { label: "Авторский", value: "author" },
  { label: "Байкал рядом", value: "baikal" },
] as const satisfies readonly SelectOption[];

export const ROUTE_ACCESS_OPTIONS = [
  { label: "Бесплатный", value: "free" },
  { label: "Платный", value: "paid" },
] as const satisfies readonly SelectOption[];

export const ROUTE_DIFFICULTY_OPTIONS = [
  { label: "Лёгкая", value: "easy" },
  { label: "Средняя", value: "medium" },
  { label: "Сложная", value: "hard" },
] as const satisfies readonly SelectOption[];

export const ARTICLE_CATEGORY_OPTIONS = [
  { label: "История города", value: "history" },
  { label: "Что посмотреть", value: "what-to-see" },
  { label: "Где гулять", value: "where-to-walk" },
  { label: "Архитектура", value: "architecture" },
  { label: "Улицы и районы", value: "streets" },
  { label: "Байкал рядом", value: "baikal" },
  { label: "Зима", value: "winter" },
  { label: "Неочевидные места", value: "hidden" },
  { label: "Для местных", value: "locals" },
  { label: "Для бизнеса", value: "business" },
] as const satisfies readonly SelectOption[];

export const MATERIAL_TYPE_OPTIONS = [
  { label: "Статья", value: "article" },
  { label: "История", value: "history" },
  { label: "Место", value: "place" },
  { label: "Гид", value: "guide" },
] as const satisfies readonly SelectOption[];

export const EVENT_CATEGORY_OPTIONS = [
  { label: "Фестивали", value: "festival" },
  { label: "Концерты", value: "concert" },
  { label: "Выставки", value: "exhibition" },
  { label: "Лёд", value: "ice" },
  { label: "Байкал", value: "baikal" },
  { label: "Гастрономия", value: "gastronomy" },
  { label: "Спорт", value: "sport" },
  { label: "Культура", value: "culture" },
  { label: "Форумы", value: "forum" },
  { label: "Другое", value: "other" },
] as const satisfies readonly SelectOption[];

export const PRODUCT_CATEGORY_OPTIONS = [
  { label: "Одежда", value: "clothing" },
  { label: "Постеры", value: "posters" },
  { label: "Открытки", value: "postcards" },
  { label: "Арт-объекты", value: "art" },
  { label: "Книги", value: "books" },
  { label: "Сувениры", value: "souvenirs" },
  { label: "Керамика", value: "ceramics" },
  { label: "Еда и напитки", value: "food" },
] as const satisfies readonly SelectOption[];

export const PRODUCT_STOCK_OPTIONS = [
  { label: "В наличии", value: "in_stock" },
  { label: "Предзаказ", value: "pre_order" },
  { label: "Нет в наличии", value: "out_of_stock" },
  { label: "Скоро", value: "soon" },
] as const satisfies readonly SelectOption[];

export const EXCURSION_FORMAT_OPTIONS = [
  { label: "Пешая", value: "walking" },
  { label: "Автобусная", value: "bus" },
  { label: "Гастро", value: "gastro" },
  { label: "Авторская", value: "author" },
  { label: "Корпоративная", value: "corporate" },
  { label: "Байкал", value: "baikal" },
  { label: "Ночная", value: "night" },
] as const satisfies readonly SelectOption[];

export const LEAD_SOURCE_OPTIONS = [
  { label: "Главная страница", value: "home" },
  { label: "Конструктор программы", value: "program" },
  { label: "Страница контактов", value: "contacts" },
  { label: "Boosty", value: "boosty" },
  { label: "Страница маршрута", value: "route" },
  { label: "Статья", value: "article" },
  { label: "Событие", value: "event" },
  { label: "Экскурсия", value: "excursion" },
  { label: "Страница товара", value: "product" },
  { label: "Раздел «Экскурсии»", value: "excursions" },
  { label: "Раздел «Магазин»", value: "shop" },
  { label: "Раздел «Карта»", value: "map" },
  { label: "Фотоархив", value: "photos" },
  { label: "Прямой заход", value: "direct" },
  { label: "Другое", value: "other" },
] as const satisfies readonly SelectOption[];

export const PHOTO_CATEGORY_OPTIONS = [
  { label: "Старый Иркутск", value: "old-irkutsk" },
  { label: "Современный Иркутск", value: "modern-irkutsk" },
  { label: "Улицы", value: "streets" },
  { label: "Деревянная архитектура", value: "wooden" },
  { label: "Дворы", value: "yards" },
  { label: "Люди и город", value: "people" },
  { label: "Детали", value: "details" },
  { label: "Байкал рядом", value: "baikal" },
  { label: "Зима", value: "winter" },
  { label: "Другое", value: "other" },
] as const satisfies readonly SelectOption[];

export const PHOTO_TYPE_OPTIONS = [
  { label: "Старое фото", value: "old" },
  { label: "Современное фото", value: "modern" },
  { label: "Пара «было / стало»", value: "before_after_pair" },
  { label: "Деталь", value: "detail" },
  { label: "Архивное", value: "archive" },
  { label: "От пользователя", value: "user_submitted" },
] as const satisfies readonly SelectOption[];

export const PHOTO_MODERATION_OPTIONS = [
  { label: "На модерации", value: "pending" },
  { label: "Одобрено", value: "approved" },
  { label: "Отклонено", value: "rejected" },
  { label: "Требует проверки", value: "needs_review" },
] as const satisfies readonly SelectOption[];

export const PHOTO_RIGHTS_OPTIONS = [
  { label: "Собственное фото", value: "own_photo" },
  { label: "Разрешение правообладателя", value: "user_permission" },
  { label: "Общественное достояние", value: "public_domain" },
  { label: "Лицензия", value: "licensed" },
  { label: "Неизвестно", value: "unknown" },
] as const satisfies readonly SelectOption[];

export const ROUTE_CATEGORY_LABELS = labelsFromOptions(ROUTE_CATEGORY_OPTIONS);
export const ARTICLE_CATEGORY_LABELS = labelsFromOptions(ARTICLE_CATEGORY_OPTIONS);
export const EVENT_CATEGORY_LABELS = labelsFromOptions(EVENT_CATEGORY_OPTIONS);
export const PRODUCT_CATEGORY_LABELS = labelsFromOptions(PRODUCT_CATEGORY_OPTIONS);
export const PRODUCT_STOCK_LABELS = labelsFromOptions(PRODUCT_STOCK_OPTIONS);
export const ROUTE_FORMAT_LABELS = labelsFromOptions(ROUTE_FORMAT_OPTIONS);
export const ROUTE_ACCESS_LABELS = labelsFromOptions(ROUTE_ACCESS_OPTIONS);
export const ROUTE_DIFFICULTY_LABELS = labelsFromOptions(ROUTE_DIFFICULTY_OPTIONS);
export const LEAD_SOURCE_LABELS = labelsFromOptions(LEAD_SOURCE_OPTIONS);
export const PHOTO_CATEGORY_LABELS = labelsFromOptions(PHOTO_CATEGORY_OPTIONS);
export const PHOTO_TYPE_LABELS = labelsFromOptions(PHOTO_TYPE_OPTIONS);
export const PHOTO_MODERATION_LABELS = labelsFromOptions(PHOTO_MODERATION_OPTIONS);
export const PHOTO_RIGHTS_LABELS = labelsFromOptions(PHOTO_RIGHTS_OPTIONS);

export function labelFor(
  map: Record<string, string>,
  value: string | null | undefined,
  fallback = "—"
): string {
  if (!value) return fallback;
  return map[value] ?? fallback;
}
