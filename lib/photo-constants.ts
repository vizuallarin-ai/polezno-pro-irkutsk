export const PHOTOS_HUB_PATH = "/explore/photos" as const;

export const PHOTOS_PAGE_TITLE =
  "Фото Иркутска — старые и современные снимки города";

export const PHOTOS_PAGE_DESCRIPTION =
  "Фотоархив Иркутска: старые и современные фотографии улиц, домов, дворов, деталей города и мест, связанных с маршрутами.";

export const PHOTO_CONSENT_VERSION = "2026-06-01";

export const PHOTO_RIGHTS_CONSENT_TEXT =
  "Я подтверждаю, что обладаю правами на это фото или имею разрешение правообладателя на его публикацию, и разрешаю разместить фото на сайте irkportal.ru с указанием авторства и предоставленной мной информации.";

export const PHOTO_MODERATION_CONSENT_TEXT =
  "Я понимаю, что фото не публикуется автоматически и будет размещено только после проверки администратором.";

export const PHOTO_PERSONAL_DATA_CONSENT_TEXT =
  "Я согласен(на) на обработку указанных контактных данных для связи по вопросу публикации фото.";

export const PHOTO_FILTER_CHIPS = [
  { id: "all", label: "Все фото" },
  { id: "old-irkutsk", label: "Старый Иркутск" },
  { id: "modern-irkutsk", label: "Современный Иркутск" },
  { id: "streets", label: "Улицы" },
  { id: "wooden", label: "Деревянная архитектура" },
  { id: "yards", label: "Дворы" },
  { id: "people", label: "Люди и город" },
  { id: "baikal", label: "Байкал рядом" },
  { id: "winter", label: "Зима" },
  { id: "details", label: "Детали города" },
] as const;

export type PhotoFilterId = (typeof PHOTO_FILTER_CHIPS)[number]["id"];

export const PHOTO_TYPE_BADGE: Record<string, string> = {
  old: "Старое фото",
  modern: "Современное фото",
  before_after_pair: "Было / стало",
  detail: "Деталь",
  archive: "Архив",
  user_submitted: "От жителя",
};
