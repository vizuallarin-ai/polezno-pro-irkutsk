import { AR_POSTCARD_PUBLISHED_WHERE } from "@/lib/cms-filters";
import { mapArPostcardDoc } from "@/lib/ar-postcard-adapter";
import type { PublicArPostcard } from "@/types/ar-postcards";

async function getPayloadSafe() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    return await getPayloadClient();
  } catch {
    return null;
  }
}

export async function getPublishedArPostcards(
  limit = 100
): Promise<PublicArPostcard[]> {
  const payload = await getPayloadSafe();
  if (!payload) return [];

  try {
    const result = await payload.find({
      collection: "ar-postcards",
      where: AR_POSTCARD_PUBLISHED_WHERE,
      limit,
      sort: "-updatedAt",
      depth: 2,
    });

    return result.docs.map((doc) =>
      mapArPostcardDoc(doc as Record<string, unknown>)
    );
  } catch {
    return [];
  }
}

export async function getFeaturedArPostcards(
  limit = 6
): Promise<PublicArPostcard[]> {
  const payload = await getPayloadSafe();
  if (!payload) return [];

  try {
    const result = await payload.find({
      collection: "ar-postcards",
      where: {
        and: [
          AR_POSTCARD_PUBLISHED_WHERE,
          { isFeatured: { equals: true } },
        ],
      },
      limit,
      sort: "-updatedAt",
      depth: 2,
    });

    const docs = result.docs.map((doc) =>
      mapArPostcardDoc(doc as Record<string, unknown>)
    );
    if (docs.length >= 2) return docs;
    const all = await getPublishedArPostcards(limit);
    return all.slice(0, limit);
  } catch {
    return [];
  }
}

export async function getArPostcardBySlug(
  slug: string
): Promise<PublicArPostcard | null> {
  const payload = await getPayloadSafe();
  if (!payload) return null;

  try {
    const result = await payload.find({
      collection: "ar-postcards",
      where: {
        and: [{ slug: { equals: slug } }, AR_POSTCARD_PUBLISHED_WHERE],
      },
      limit: 1,
      depth: 2,
    });

    const doc = result.docs[0];
    return doc ? mapArPostcardDoc(doc as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function getPublishedArPostcardSlugs(): Promise<string[]> {
  const payload = await getPayloadSafe();
  if (!payload) return [];

  try {
    const result = await payload.find({
      collection: "ar-postcards",
      where: AR_POSTCARD_PUBLISHED_WHERE,
      limit: 1000,
      depth: 0,
    });
    return result.docs.map((doc) => String(doc.slug));
  } catch {
    return [];
  }
}

export async function getArPostcardForProduct(
  productId: string
): Promise<PublicArPostcard | null> {
  const payload = await getPayloadSafe();
  if (!payload) return null;

  try {
    const result = await payload.find({
      collection: "ar-postcards",
      where: {
        and: [
          AR_POSTCARD_PUBLISHED_WHERE,
          { relatedProduct: { equals: productId } },
        ],
      },
      limit: 1,
      depth: 1,
    });

    const doc = result.docs[0];
    return doc ? mapArPostcardDoc(doc as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function getArPostcardForPhoto(
  photoId: string
): Promise<PublicArPostcard | null> {
  const payload = await getPayloadSafe();
  if (!payload) return null;

  try {
    const result = await payload.find({
      collection: "ar-postcards",
      where: {
        and: [
          AR_POSTCARD_PUBLISHED_WHERE,
          { relatedPhoto: { equals: photoId } },
        ],
      },
      limit: 1,
      depth: 1,
    });

    const doc = result.docs[0];
    return doc ? mapArPostcardDoc(doc as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function getArPostcardByProductRelation(
  productSlug: string
): Promise<PublicArPostcard | null> {
  const payload = await getPayloadSafe();
  if (!payload) return null;

  try {
    const productRes = await payload.find({
      collection: "products",
      where: { slug: { equals: productSlug } },
      limit: 1,
      depth: 0,
    });
    const product = productRes.docs[0];
    if (!product) return null;

    const relatedId = (product as { relatedArPostcard?: unknown }).relatedArPostcard;
    if (relatedId) {
      const id =
        typeof relatedId === "object" && relatedId && "id" in relatedId
          ? String((relatedId as { id: string }).id)
          : String(relatedId);
      try {
        const doc = await payload.findByID({
          collection: "ar-postcards",
          id,
          depth: 1,
        });
        if (doc && doc.status === "published") {
          return mapArPostcardDoc(doc as Record<string, unknown>);
        }
      } catch {
        // fall through
      }
    }

    return getArPostcardForProduct(String(product.id));
  } catch {
    return null;
  }
}
