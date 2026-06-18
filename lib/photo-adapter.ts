import type {
  PhotoCategory,
  PhotoModerationStatus,
  PhotoRightsType,
  PhotoType,
  PublicPhoto,
} from "@/types/photos";

export type PhotoDoc = {
  id: string | number;
  slug: string;
  title: string;
  description?: string;
  category: PhotoCategory;
  photoType: PhotoType;
  year?: number;
  period?: string;
  street?: string;
  place?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  authorName?: string;
  sourceName?: string;
  sourceUrl?: string;
  rightsType?: PhotoRightsType;
  licenseText?: string;
  imageAlt?: string;
  status?: string;
  moderationStatus?: PhotoModerationStatus;
  beforeAfterCaption?: string;
  pairedPhotoYear?: number;
  publishedAt?: string;
  updatedAt?: string;
  image?: MediaDoc | string | number | null;
  pairedPhoto?: PhotoDoc | string | number | null;
  relatedArticles?: Array<{ slug?: string; title?: string } | string | number>;
  relatedRoutes?: Array<{ slug?: string; title?: string } | string | number>;
  seo?: { title?: string; description?: string; image?: MediaDoc | string | null };
};

type MediaDoc = {
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  sizes?: {
    thumbnail?: { url?: string; width?: number; height?: number };
    card?: { url?: string; width?: number; height?: number };
    hero?: { url?: string; width?: number; height?: number };
  };
  filename?: string;
};

function resolveMedia(ref: MediaDoc | string | number | null | undefined): {
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
} {
  if (!ref || typeof ref === "string" || typeof ref === "number") {
    return {};
  }
  return {
    url: ref.sizes?.hero?.url ?? ref.sizes?.card?.url ?? ref.url,
    thumbnailUrl: ref.sizes?.thumbnail?.url ?? ref.sizes?.card?.url ?? ref.url,
    width: ref.width,
    height: ref.height,
    alt: ref.alt,
  };
}

function buildAlt(photo: PhotoDoc): string {
  if (photo.imageAlt?.trim()) return photo.imageAlt.trim();
  const parts = [photo.title];
  const place = [photo.street, photo.place].filter(Boolean).join(", ");
  if (place) parts.push(place);
  if (photo.year) parts.push(String(photo.year));
  else if (photo.period) parts.push(photo.period);
  parts.push("Иркутск");
  return parts.join(", ");
}

function mapRelation(
  items: PhotoDoc["relatedArticles"]
): PublicPhoto["relatedArticles"] {
  if (!items?.length) return [];
  return items
    .map((item) => {
      if (!item || typeof item === "string" || typeof item === "number") {
        return null;
      }
      if (!item.slug || !item.title) return null;
      return { slug: item.slug, title: item.title };
    })
    .filter(Boolean) as PublicPhoto["relatedArticles"];
}

export function photoDocToPublicPhoto(doc: PhotoDoc): PublicPhoto {
  const media = resolveMedia(doc.image);
  const paired =
    doc.pairedPhoto && typeof doc.pairedPhoto === "object"
      ? photoDocToPublicPhoto(doc.pairedPhoto)
      : null;

  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    description: doc.description ?? "",
    category: doc.category,
    photoType: doc.photoType,
    year: doc.year,
    period: doc.period,
    street: doc.street,
    place: doc.place,
    district: doc.district,
    latitude: doc.latitude,
    longitude: doc.longitude,
    authorName: doc.authorName,
    sourceName: doc.sourceName,
    sourceUrl: doc.sourceUrl,
    rightsType: doc.rightsType ?? "own_photo",
    licenseText: doc.licenseText,
    imageUrl: media.url ?? "/images/map-preview.svg",
    thumbnailUrl: media.thumbnailUrl ?? media.url ?? "/images/map-preview.svg",
    imageWidth: media.width,
    imageHeight: media.height,
    imageAlt: buildAlt(doc),
    beforeAfterCaption: doc.beforeAfterCaption,
    pairedPhoto: paired,
    pairedPhotoYear: doc.pairedPhotoYear,
    publishedAt: doc.publishedAt,
    relatedArticles: mapRelation(doc.relatedArticles),
    relatedRoutes: mapRelation(doc.relatedRoutes) as PublicPhoto["relatedRoutes"],
  };
}

export function formatPhotoYearLabel(photo: Pick<PublicPhoto, "year" | "period">): string {
  if (photo.year) return String(photo.year);
  if (photo.period) return photo.period;
  return "";
}

export function formatPhotoPlaceLabel(
  photo: Pick<PublicPhoto, "street" | "place" | "district">
): string {
  return [photo.street, photo.place, photo.district].filter(Boolean).join(" · ");
}
