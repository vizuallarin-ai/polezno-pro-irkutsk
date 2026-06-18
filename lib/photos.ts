import type { Where } from "payload";
import { PHOTO_PUBLISHED_WHERE } from "@/lib/cms-filters";
import { DEMO_PHOTOS } from "@/lib/data/photos";
import { photoDocToPublicPhoto, type PhotoDoc } from "@/lib/photo-adapter";
import type { PhotoFilters, PublicPhoto } from "@/types/photos";

async function getPayloadSafe() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    return await getPayloadClient();
  } catch {
    return null;
  }
}

function applyClientFilters(photos: PublicPhoto[], filters?: PhotoFilters): PublicPhoto[] {
  let result = photos;
  if (filters?.category && filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters?.photoType && filters.photoType !== "all") {
    if (filters.photoType === "old") {
      result = result.filter((p) => p.photoType === "old" || p.category === "old-irkutsk");
    } else if (filters.photoType === "modern") {
      result = result.filter(
        (p) => p.photoType === "modern" || p.category === "modern-irkutsk"
      );
    }
  }
  if (filters?.year) {
    result = result.filter((p) => p.year === filters.year);
  }
  if (filters?.street?.trim()) {
    const q = filters.street.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.street?.toLowerCase().includes(q) ||
        p.place?.toLowerCase().includes(q)
    );
  }
  if (filters?.author?.trim()) {
    const q = filters.author.trim().toLowerCase();
    result = result.filter((p) => p.authorName?.toLowerCase().includes(q));
  }
  return result;
}

function buildWhere(filters?: PhotoFilters): Where {
  const clauses: Where[] = [PHOTO_PUBLISHED_WHERE];
  if (filters?.category && filters.category !== "all") {
    clauses.push({ category: { equals: filters.category } });
  }
  if (filters?.photoType === "old") {
    clauses.push({
      or: [
        { photoType: { equals: "old" } },
        { category: { equals: "old-irkutsk" } },
      ],
    });
  }
  if (filters?.photoType === "modern") {
    clauses.push({
      or: [
        { photoType: { equals: "modern" } },
        { category: { equals: "modern-irkutsk" } },
      ],
    });
  }
  if (filters?.year) {
    clauses.push({ year: { equals: filters.year } });
  }
  if (filters?.street?.trim()) {
    clauses.push({
      or: [
        { street: { contains: filters.street.trim() } },
        { place: { contains: filters.street.trim() } },
      ],
    });
  }
  if (filters?.author?.trim()) {
    clauses.push({ authorName: { contains: filters.author.trim() } });
  }
  return clauses.length === 1 ? clauses[0] : { and: clauses };
}

export async function getPublishedPhotos(
  filters?: PhotoFilters
): Promise<PublicPhoto[]> {
  const payload = await getPayloadSafe();
  if (!payload) {
    return applyClientFilters(DEMO_PHOTOS, filters);
  }

  try {
    const res = await payload.find({
      collection: "photos",
      where: buildWhere(filters),
      sort: "-publishedAt",
      limit: 200,
      depth: 2,
    });

    const photos = res.docs.map((doc) =>
      photoDocToPublicPhoto(doc as PhotoDoc)
    );
    return photos.length > 0 ? photos : applyClientFilters(DEMO_PHOTOS, filters);
  } catch {
    return applyClientFilters(DEMO_PHOTOS, filters);
  }
}

export async function getPhotoBySlug(slug: string): Promise<PublicPhoto | null> {
  const payload = await getPayloadSafe();
  if (!payload) {
    return DEMO_PHOTOS.find((p) => p.slug === slug) ?? null;
  }

  try {
    const res = await payload.find({
      collection: "photos",
      where: {
        and: [PHOTO_PUBLISHED_WHERE, { slug: { equals: slug } }],
      },
      limit: 1,
      depth: 2,
    });
    const doc = res.docs[0];
    if (!doc) {
      return DEMO_PHOTOS.find((p) => p.slug === slug) ?? null;
    }
    return photoDocToPublicPhoto(doc as PhotoDoc);
  } catch {
    return DEMO_PHOTOS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getFeaturedPhotos(limit = 4): Promise<PublicPhoto[]> {
  const photos = await getPublishedPhotos();
  return photos.slice(0, limit);
}

export async function getSimilarPhotos(
  photo: PublicPhoto,
  limit = 4
): Promise<PublicPhoto[]> {
  const photos = await getPublishedPhotos({
    category: photo.category,
  });
  return photos.filter((p) => p.id !== photo.id).slice(0, limit);
}

export async function getPublishedPhotoSlugs(): Promise<string[]> {
  const photos = await getPublishedPhotos();
  return photos.map((p) => p.slug);
}
