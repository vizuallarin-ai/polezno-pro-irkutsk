import {
  MAKER_CRAFT_LABELS,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STOCK_LABELS,
  PRODUCT_TYPE_LABELS,
} from "@/lib/content-labels";

export type SouvenirProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryLabel: string;
  productType: string;
  productTypeLabel: string;
  price: number | null;
  priceLabel: string | null;
  stockStatus: string;
  stockLabel: string;
  shortDescription: string | null;
  cityConnectionText: string | null;
  orderCtaLabel: string;
  isOwnMerch: boolean;
  externalLink: string | null;
  imageUrl: string | null;
  imageAlt: string;
  gallery: Array<{ url: string; alt: string }>;
  maker: SouvenirMaker | null;
  relatedRoutes: Array<{ slug: string; title: string }>;
  relatedArticles: Array<{ slug: string; title: string }>;
  relatedPhotos: Array<{ slug: string; title: string }>;
  story: unknown;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: { url?: string } | null;
  };
};

export type SouvenirMaker = {
  id: string;
  title: string;
  slug: string;
  craftType: string;
  craftLabel: string;
  shortDescription: string;
  city: string | null;
  district: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  websiteUrl: string | null;
  telegram: string | null;
  instagram: string | null;
  legalNote: string | null;
  advertisingLabelNeeded: boolean;
  placementType: string;
  story: unknown;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: { url?: string } | null;
  };
};

export function formatProductPrice(product: SouvenirProduct): string {
  if (product.priceLabel) return product.priceLabel;
  if (product.price != null && product.price > 0) {
    return `${product.price.toLocaleString("ru-RU")} ₽`;
  }
  return product.stockLabel;
}

export function mapMakerRef(doc: unknown): SouvenirMaker | null {
  if (!doc || typeof doc !== "object" || !("slug" in doc)) return null;
  const m = doc as Record<string, unknown>;
  const avatar = mediaUrl(m.avatar as { url?: string; alt?: string });
  const cover = mediaUrl(m.coverImage as { url?: string; alt?: string });
  return {
    id: String(m.id),
    title: String(m.title),
    slug: String(m.slug),
    craftType: String(m.craftType || "other"),
    craftLabel: MAKER_CRAFT_LABELS[String(m.craftType)] || String(m.craftType),
    shortDescription: String(m.shortDescription || ""),
    city: m.city ? String(m.city) : null,
    district: m.district ? String(m.district) : null,
    avatarUrl: avatar.url,
    coverUrl: cover.url,
    websiteUrl: m.websiteUrl ? String(m.websiteUrl) : null,
    telegram: m.telegram ? String(m.telegram) : null,
    instagram: m.instagram ? String(m.instagram) : null,
    legalNote: m.legalNote ? String(m.legalNote) : null,
    advertisingLabelNeeded: Boolean(m.advertisingLabelNeeded),
    placementType: String(m.placementType || "catalog"),
    story: m.story,
    seo: m.seo as SouvenirMaker["seo"],
  };
}

function mediaUrl(
  media: { url?: string; alt?: string } | null | undefined
): { url: string | null; alt: string } {
  if (!media || typeof media !== "object") return { url: null, alt: "" };
  return { url: media.url ? String(media.url) : null, alt: String(media.alt || "") };
}

function mapRelationList(items: unknown): Array<{ slug: string; title: string }> {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === "object" && "slug" in item)
    .map((item) => {
      const doc = item as { slug: string; title: string };
      return { slug: String(doc.slug), title: String(doc.title) };
    })
    .filter((item) => item.slug && item.title);
}

export function mapProductDoc(doc: Record<string, unknown>): SouvenirProduct {
  const galleryRaw = doc.gallery as
    | Array<{ image?: { url?: string; alt?: string } }>
    | undefined;
  const gallery =
    galleryRaw?.map((item) => {
      const img = mediaUrl(item.image);
      return { url: img.url || "/images/map-preview.svg", alt: img.alt };
    }) || [];
  const first = gallery[0];
  const relatedRoute = doc.relatedRoute;
  const relatedRoutes = mapRelationList(doc.relatedRoutes);
  if (
    relatedRoute &&
    typeof relatedRoute === "object" &&
    "slug" in relatedRoute &&
    !relatedRoutes.some((r) => r.slug === String((relatedRoute as { slug: string }).slug))
  ) {
    relatedRoutes.push({
      slug: String((relatedRoute as { slug: string }).slug),
      title: String((relatedRoute as { title?: string }).title || ""),
    });
  }

  return {
    id: String(doc.id),
    title: String(doc.title),
    slug: String(doc.slug),
    category: String(doc.category),
    categoryLabel:
      PRODUCT_CATEGORY_LABELS[String(doc.category)] || String(doc.category),
    productType: String(doc.productType || "own_merch"),
    productTypeLabel:
      PRODUCT_TYPE_LABELS[String(doc.productType)] ||
      String(doc.productType || "own_merch"),
    price: doc.price != null ? Number(doc.price) : null,
    priceLabel: doc.priceLabel ? String(doc.priceLabel) : null,
    stockStatus: String(doc.stockStatus || "soon"),
    stockLabel:
      PRODUCT_STOCK_LABELS[String(doc.stockStatus)] ||
      String(doc.stockStatus || "soon"),
    shortDescription: doc.shortDescription ? String(doc.shortDescription) : null,
    cityConnectionText: doc.cityConnectionText
      ? String(doc.cityConnectionText)
      : null,
    orderCtaLabel: doc.orderCtaLabel
      ? String(doc.orderCtaLabel)
      : "Оставить заявку",
    isOwnMerch: Boolean(doc.isOwnMerch ?? doc.productType === "own_merch"),
    externalLink: doc.externalLink ? String(doc.externalLink) : null,
    imageUrl: first?.url || null,
    imageAlt: first?.alt || String(doc.title),
    gallery,
    maker: mapMakerRef(doc.maker),
    relatedRoutes,
    relatedArticles: mapRelationList(doc.relatedArticles),
    relatedPhotos: mapRelationList(doc.relatedPhotos),
    story: doc.story,
    seo: doc.seo as SouvenirProduct["seo"],
  };
}

export const SOUVENIR_CATEGORY_FILTERS = [
  { value: "all", label: "Все" },
  { value: "own", label: "Мерч Иркпортала" },
  { value: "makers", label: "Местные мастера" },
  { value: "postcards", label: "Открытки" },
  { value: "posters", label: "Постеры" },
  { value: "maps_routes", label: "Карты" },
  { value: "mini_guides", label: "Мини-гиды" },
] as const;
