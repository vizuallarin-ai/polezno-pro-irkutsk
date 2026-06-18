export type PhotoCategory =
  | "old-irkutsk"
  | "modern-irkutsk"
  | "streets"
  | "wooden"
  | "yards"
  | "people"
  | "details"
  | "baikal"
  | "winter"
  | "other";

export type PhotoType =
  | "old"
  | "modern"
  | "before_after_pair"
  | "detail"
  | "archive"
  | "user_submitted";

export type PhotoModerationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_review";

export type PhotoRightsType =
  | "own_photo"
  | "user_permission"
  | "public_domain"
  | "licensed"
  | "unknown";

export interface PublicPhoto {
  id: string;
  slug: string;
  title: string;
  description: string;
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
  rightsType: PhotoRightsType;
  licenseText?: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt: string;
  beforeAfterCaption?: string;
  pairedPhoto?: PublicPhoto | null;
  pairedPhotoYear?: number;
  publishedAt?: string;
  relatedArticles: Array<{ slug: string; title: string }>;
  relatedRoutes: Array<{ slug: string; title: string }>;
}

export interface PhotoFilters {
  category?: PhotoCategory | "all";
  photoType?: PhotoType | "old" | "modern" | "all";
  year?: number;
  street?: string;
  author?: string;
}
