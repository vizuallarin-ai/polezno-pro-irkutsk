import {
  AR_POSTCARD_EFFECT_LABELS,
  type ArPostcardEffectType,
} from "@/lib/ar-postcard-constants";
import type { ArPostcardRelation, PublicArPostcard } from "@/types/ar-postcards";

function mediaUrl(
  media: { url?: string; alt?: string } | null | undefined
): { url: string | null; alt: string } {
  if (!media || typeof media !== "object") return { url: null, alt: "" };
  return {
    url: media.url ? String(media.url) : null,
    alt: String(media.alt || ""),
  };
}

function mapRelation(
  doc: unknown,
  imageField = "image"
): ArPostcardRelation | null {
  if (!doc || typeof doc !== "object" || !("slug" in doc)) return null;
  const d = doc as Record<string, unknown>;
  const image =
    imageField === "coverImage"
      ? mediaUrl(d.coverImage as { url?: string })
      : mediaUrl(d.image as { url?: string });
  const gallery = d.gallery as Array<{ image?: { url?: string } }> | undefined;
  const galleryUrl = gallery?.[0]?.image?.url
    ? String(gallery[0].image.url)
    : null;

  return {
    id: String(d.id),
    slug: String(d.slug),
    title: String(d.title),
    imageUrl: image.url || galleryUrl,
  };
}

function resolveVideoUrl(doc: Record<string, unknown>): string | null {
  if (doc.animationVideoUrl && String(doc.animationVideoUrl).trim()) {
    return String(doc.animationVideoUrl).trim();
  }
  const media = mediaUrl(doc.animationVideo as { url?: string });
  return media.url;
}

function resolveAudioUrl(doc: Record<string, unknown>): string | null {
  if (doc.audioUrl && String(doc.audioUrl).trim()) {
    return String(doc.audioUrl).trim();
  }
  const media = mediaUrl(doc.audioFile as { url?: string });
  return media.url;
}

export function mapArPostcardDoc(doc: Record<string, unknown>): PublicArPostcard {
  const cover = mediaUrl(doc.coverImage as { url?: string });
  const postcard = mediaUrl(doc.postcardImage as { url?: string });
  const poster = mediaUrl(doc.animationPosterImage as { url?: string });
  const effectType = String(doc.effectType || "coming_soon") as ArPostcardEffectType;
  const slug = String(doc.slug);

  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "https://irkportal.ru";

  return {
    id: String(doc.id),
    title: String(doc.title),
    slug,
    shortDescription: doc.shortDescription ? String(doc.shortDescription) : null,
    fullDescription: doc.fullDescription,
    effectType,
    effectUrl: doc.effectUrl ? String(doc.effectUrl) : null,
    qrTargetUrl:
      doc.qrTargetUrl && String(doc.qrTargetUrl).trim()
        ? String(doc.qrTargetUrl)
        : `${baseUrl}/ar-postcards/${slug}`,
    coverImageUrl: cover.url || postcard.url,
    coverImageAlt: cover.alt || postcard.alt || String(doc.title),
    postcardImageUrl: postcard.url || cover.url,
    postcardImageAlt: postcard.alt || cover.alt || String(doc.title),
    animationVideoUrl: resolveVideoUrl(doc),
    animationPosterUrl: poster.url || postcard.url || cover.url,
    audioUrl: resolveAudioUrl(doc),
    audioTranscript: doc.audioTranscript ? String(doc.audioTranscript) : null,
    place: doc.place ? String(doc.place) : null,
    street: doc.street ? String(doc.street) : null,
    year: doc.year != null ? Number(doc.year) : null,
    authorName: doc.authorName ? String(doc.authorName) : null,
    sourceName: doc.sourceName ? String(doc.sourceName) : null,
    rightsType: String(doc.rightsType || "unknown"),
    licenseText: doc.licenseText ? String(doc.licenseText) : null,
    isFeatured: Boolean(doc.isFeatured),
    isDiscontinued: Boolean(doc.isDiscontinued),
    relatedProduct: mapRelation(doc.relatedProduct, "gallery"),
    relatedPhoto: mapRelation(doc.relatedPhoto, "image"),
    relatedRoute: mapRelation(doc.relatedRoute, "coverImage"),
    relatedMaterial: mapRelation(doc.relatedMaterial, "coverImage"),
    seo: doc.seo as PublicArPostcard["seo"],
  };
}

export function effectTypeLabel(effectType: ArPostcardEffectType): string {
  return AR_POSTCARD_EFFECT_LABELS[effectType] || effectType;
}
