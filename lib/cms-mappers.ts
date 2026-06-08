import type { Article } from "@/components/sections/explore-preview";
import type { Product } from "@/components/sections/shop-preview";

const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  sights: "Что посмотреть",
  walks: "Где гулять",
  food: "Где поесть",
  stay: "Где остановиться",
  history: "История города",
  facts: "Интересные факты",
  baikal: "Байкал",
  hidden: "Hidden Places",
  gastronomy: "Гастрономия",
  architecture: "Архитектура",
  excursions: "Экскурсии",
};

const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  clothing: "Одежда",
  posters: "Постеры",
  postcards: "Открытки",
  art: "Арт-объекты",
  books: "Книги",
  souvenirs: "Сувениры",
  ceramics: "Керамика",
  food: "Еда и напитки",
};

function coverFromDoc(doc: {
  coverImage?: { url?: string } | null;
  coverUrl?: string | null;
  gallery?: Array<{ image?: { url?: string } }> | null;
}): string {
  if (doc.coverImage && typeof doc.coverImage === "object" && doc.coverImage.url) {
    return String(doc.coverImage.url);
  }
  if (doc.coverUrl) return String(doc.coverUrl);
  const galleryUrl = doc.gallery?.[0]?.image?.url;
  if (galleryUrl) return String(galleryUrl);
  return "/images/article-wooden.svg";
}

export function mapArticleForPreview(doc: {
  id: string | number;
  title: string;
  category: string;
  excerpt?: string | null;
  slug: string;
  readTime?: number | null;
  isHiddenGem?: boolean | null;
  coverImage?: { url?: string } | null;
  coverUrl?: string | null;
}): Article {
  return {
    id: String(doc.id),
    title: String(doc.title),
    category: ARTICLE_CATEGORY_LABELS[String(doc.category)] || String(doc.category),
    excerpt: String(doc.excerpt || ""),
    slug: String(doc.slug),
    coverImage: coverFromDoc(doc),
    readTime: doc.readTime != null ? Number(doc.readTime) : undefined,
    isHiddenGem: Boolean(doc.isHiddenGem),
  };
}

export function mapProductForPreview(doc: {
  id: string | number;
  title: string;
  category: string;
  price: number;
  slug: string;
  shortDescription?: string | null;
  gallery?: Array<{ image?: { url?: string } }> | null;
}): Product {
  return {
    id: String(doc.id),
    title: String(doc.title),
    category:
      PRODUCT_CATEGORY_LABELS[String(doc.category)] || String(doc.category),
    price: Number(doc.price),
    slug: String(doc.slug),
    image: coverFromDoc(doc),
    story: doc.shortDescription ? String(doc.shortDescription) : undefined,
  };
}
