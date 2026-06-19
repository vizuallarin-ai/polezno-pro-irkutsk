import type { ArPostcardEffectType } from "@/lib/ar-postcard-constants";

export type ArPostcardRelation = {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string | null;
};

export type PublicArPostcard = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: unknown;
  effectType: ArPostcardEffectType;
  effectUrl: string | null;
  qrTargetUrl: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  postcardImageUrl: string | null;
  postcardImageAlt: string;
  animationVideoUrl: string | null;
  animationPosterUrl: string | null;
  audioUrl: string | null;
  audioTranscript: string | null;
  place: string | null;
  street: string | null;
  year: number | null;
  authorName: string | null;
  sourceName: string | null;
  rightsType: string;
  licenseText: string | null;
  isFeatured: boolean;
  isDiscontinued: boolean;
  relatedProduct: ArPostcardRelation | null;
  relatedPhoto: ArPostcardRelation | null;
  relatedRoute: ArPostcardRelation | null;
  relatedMaterial: ArPostcardRelation | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: { url?: string } | null;
  };
};
