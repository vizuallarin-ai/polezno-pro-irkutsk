import type { PublicPhoto } from "@/types/photos";

/** Curated SVG fallbacks from the project archive — no external stock. */
export const CURATED_FALLBACKS = {
  hero: "/images/explore-history.svg",
  route: "/images/map-preview.svg",
  explore: "/images/explore-walks.svg",
  business: "/images/direction-consulting.svg",
  souvenir: "/images/product-postcards.svg",
  author: "/images/founder-portrait.svg",
  wooden: "/images/article-wooden.svg",
  default: "/images/placeholder.svg",
} as const;

export type CuratedFallbackKey = keyof typeof CURATED_FALLBACKS;

export type ResolvedVisualImage = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  sourceLabel?: string;
  year?: string | number;
  place?: string;
};

type ResolveVisualImageInput = {
  /** Primary image URL (entity cover, point image, etc.) */
  coverUrl?: string | null;
  /** Related published photo from archive */
  photo?: PublicPhoto | null;
  /** Curated fallback when nothing else is available */
  fallback?: CuratedFallbackKey | string;
  alt: string;
  caption?: string;
  credit?: string;
  sourceLabel?: string;
  year?: string | number;
  place?: string;
};

export function resolveVisualImage({
  coverUrl,
  photo,
  fallback = "default",
  alt,
  caption,
  credit,
  sourceLabel,
  year,
  place,
}: ResolveVisualImageInput): ResolvedVisualImage {
  if (coverUrl) {
    return {
      src: coverUrl,
      alt,
      caption,
      credit,
      sourceLabel,
      year,
      place,
    };
  }

  if (photo?.imageUrl || photo?.thumbnailUrl) {
    return {
      src: photo.thumbnailUrl || photo.imageUrl,
      alt: photo.imageAlt || alt,
      caption: caption || photo.title,
      credit: credit || photo.authorName,
      sourceLabel: sourceLabel || photo.sourceName,
      year: year ?? photo.year ?? photo.period,
      place: place ?? photo.place ?? photo.street,
    };
  }

  const fallbackSrc =
    fallback in CURATED_FALLBACKS
      ? CURATED_FALLBACKS[fallback as CuratedFallbackKey]
      : fallback;

  return {
    src: fallbackSrc,
    alt,
    caption,
    credit,
    sourceLabel,
    year,
    place,
  };
}

/** Human editorial copy for empty states — no crude «Фото скоро». */
export const VISUAL_EMPTY_COPY = {
  routes:
    "Маршруты ещё собираются. Загляните позже — или напишите, если нужна программа под ваш визит.",
  routePoints:
    "Здесь будет снимок точки — пока опишем место словами, а фото добавим, когда найдём удачный ракурс.",
  photos:
    "Архив только открывается. Первые снимки уже в работе — можно предложить своё фото.",
  photosFiltered:
    "По этим фильтрам ничего не нашлось. Попробуйте другой период, улицу или категорию.",
  souvenirs:
    "Каталог пополняется — открытки и карты уже готовятся к печати. Напишите, если хотите узнать первыми.",
  souvenirsMaker:
    "У мастера пока нет товаров в каталоге — загляните позже или свяжитесь с нами.",
  materials:
    "В этом разделе пока тихо. Материалы готовим и публикуем по одному — без спешки.",
  events:
    "Ближайших событий пока нет. Подпишитесь на Telegram — там появляется первым.",
  shop:
    "Магазин открывается. Коллекции готовим вместе с маршрутами и материалами проекта.",
} as const;
