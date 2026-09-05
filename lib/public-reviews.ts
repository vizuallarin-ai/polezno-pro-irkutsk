import { isDemoPublicMarker } from "@/lib/content-readiness";

export type PublicReview = {
  id: string;
  text: string;
  author: string;
  city?: string;
  photo?: { url?: string };
};

/**
 * Featured reviews for public trust surfaces.
 * Fail-closed: empty text/author, demo markers, or seed-like names are excluded.
 * Never invent reviews when the list is empty — callers must show methodology trust instead.
 */
export function toPublicReview(doc: {
  id?: string | number;
  text?: unknown;
  author?: unknown;
  city?: unknown;
  photo?: unknown;
}): PublicReview | null {
  const text = typeof doc.text === "string" ? doc.text.trim() : "";
  const author = typeof doc.author === "string" ? doc.author.trim() : "";
  if (!text || !author) return null;
  if (isDemoPublicMarker(text) || isDemoPublicMarker(author)) return null;

  const photo =
    doc.photo &&
    typeof doc.photo === "object" &&
    doc.photo !== null &&
    "url" in doc.photo &&
    typeof (doc.photo as { url?: unknown }).url === "string"
      ? { url: String((doc.photo as { url: string }).url) }
      : undefined;

  if (photo?.url && isDemoPublicMarker(photo.url)) return null;

  return {
    id: String(doc.id ?? ""),
    text,
    author,
    city:
      typeof doc.city === "string" && doc.city.trim()
        ? doc.city.trim()
        : undefined,
    photo,
  };
}

export async function getFeaturedPublicReviews(
  limit = 3
): Promise<PublicReview[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "reviews",
      where: { isFeatured: { equals: true } },
      limit: Math.max(limit * 2, 6),
      depth: 1,
    });
    const out: PublicReview[] = [];
    for (const doc of result.docs) {
      const mapped = toPublicReview(doc as never);
      if (!mapped) continue;
      out.push(mapped);
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}
