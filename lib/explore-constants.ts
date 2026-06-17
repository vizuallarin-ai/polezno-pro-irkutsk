/** Раздел «Исследовать» — категории, SEO и метаданные. */

export const EXPLORE_PAGE_TITLE =
  "Исследовать Иркутск — история, места и маршруты";
export const EXPLORE_PAGE_DESCRIPTION =
  "История, места, маршруты и городские детали Иркутска. Материалы от местных — без туристических штампов.";
export const EXPLORE_H1 = "Исследовать Иркутск";
export const EXPLORE_SUBTITLE =
  "История, места, маршруты и городские детали";

export type ExploreCategorySlug =
  | "history"
  | "what-to-see"
  | "where-to-walk"
  | "architecture"
  | "streets"
  | "baikal"
  | "winter"
  | "hidden"
  | "locals"
  | "business";

export type ExploreCategory = {
  slug: ExploreCategorySlug;
  label: string;
  description: string;
  seoDescription: string;
  image: string;
};

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    slug: "history",
    label: "История города",
    description: "От казачьего острога до современного Иркутска",
    seoDescription:
      "История Иркутска: острог, купечество, декабристы, Транссиб и город сегодня.",
    image: "/images/explore-history.svg",
  },
  {
    slug: "what-to-see",
    label: "Что посмотреть",
    description: "Достопримечательности, музеи и обязательные места",
    seoDescription:
      "Что посмотреть в Иркутске: достопримечательности, музеи и исторические места.",
    image: "/images/explore-sights.svg",
  },
  {
    slug: "where-to-walk",
    label: "Где гулять",
    description: "Набережные, парки и пешеходные маршруты",
    seoDescription:
      "Где гулять в Иркутске: набережные, бульвары, парки и лучшие пешеходные маршруты.",
    image: "/images/explore-walks.svg",
  },
  {
    slug: "architecture",
    label: "Архитектура",
    description: "Деревянное зодчество, модерн и советский конструктивизм",
    seoDescription:
      "Архитектура Иркутска: деревянные дома с резными наличниками и купеческие особняки.",
    image: "/images/article-wooden.svg",
  },
  {
    slug: "streets",
    label: "Улицы и районы",
    description: "Кварталы, переулки и городская география",
    seoDescription:
      "Улицы и районы Иркутска: как ориентироваться в городе и что смотреть в каждом квартале.",
    image: "/images/explore-walks.svg",
  },
  {
    slug: "baikal",
    label: "Байкал рядом",
    description: "Что и как смотреть на Байкале из Иркутска",
    seoDescription:
      "Байкал из Иркутска: как добраться, что посмотреть, когда ехать.",
    image: "/images/explore-baikal.svg",
  },
  {
    slug: "winter",
    label: "Зима",
    description: "Иркутск и Байкал в холодное время года",
    seoDescription:
      "Зимний Иркутск: мороз, лёд, городские прогулки и поездки к Байкалу.",
    image: "/images/explore-baikal.svg",
  },
  {
    slug: "hidden",
    label: "Неочевидные места",
    description: "Места, которые знают только местные",
    seoDescription:
      "Секретные места Иркутска — локации вне путеводителей.",
    image: "/images/explore-hidden.svg",
  },
  {
    slug: "locals",
    label: "Для местных",
    description: "Город глазами тех, кто здесь живёт",
    seoDescription:
      "Иркутск для местных: дворы, привычные маршруты и городские детали.",
    image: "/images/explore-facts.svg",
  },
  {
    slug: "business",
    label: "Для бизнеса",
    description: "Деловые визиты, делегации и корпоративные программы",
    seoDescription:
      "Иркутск для бизнеса: программы для делегаций, корпоративов и деловых гостей.",
    image: "/images/explore-stay.svg",
  },
];

export const EXPLORE_CATEGORY_BY_SLUG = Object.fromEntries(
  EXPLORE_CATEGORIES.map((c) => [c.slug, c])
) as Record<ExploreCategorySlug, ExploreCategory>;

export const EXPLORE_CATEGORY_LABELS = Object.fromEntries(
  EXPLORE_CATEGORIES.map((c) => [c.slug, c.label])
) as Record<ExploreCategorySlug, string>;

/** Старые slug категорий CMS → актуальные (обратная совместимость). */
export const LEGACY_ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  sights: "Что посмотреть",
  walks: "Где гулять",
  food: "Где поесть",
  stay: "Где остановиться",
  facts: "Интересные факты",
  gastronomy: "Гастрономия",
  excursions: "Экскурсии",
};

export function exploreCategoryLabel(slug: string): string {
  return (
    EXPLORE_CATEGORY_LABELS[slug as ExploreCategorySlug] ||
    LEGACY_ARTICLE_CATEGORY_LABELS[slug] ||
    slug
  );
}

export function exploreCategoryMeta(slug: string): ExploreCategory | undefined {
  return EXPLORE_CATEGORY_BY_SLUG[slug as ExploreCategorySlug];
}

export function isExploreCategorySlug(slug: string): slug is ExploreCategorySlug {
  return slug in EXPLORE_CATEGORY_BY_SLUG;
}

export function categoryPageTitle(label: string): string {
  return `${label} — Исследовать Иркутск`;
}
