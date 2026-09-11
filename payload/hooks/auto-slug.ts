import type {
  CollectionBeforeValidateHook,
  Payload,
  TypeWithID,
  Where,
} from "payload";
import {
  isForbiddenPublicSlug,
  isValidSlug,
  nextSlugCandidate,
  slugifyTitle,
} from "@/lib/slug";

type AutoSlugOptions = {
  /** Field to derive slug from when slug is empty. */
  sourceField: "title" | "name";
  /** Fallback base when source is empty. */
  fallback?: string;
};

async function resolveUniqueSlug(
  payload: Payload,
  collection: string,
  base: string,
  excludeId?: string | number
): Promise<string> {
  const safeBase =
    base && isValidSlug(base) && !isForbiddenPublicSlug(base)
      ? base
      : "item";

  for (let attempt = 1; attempt <= 50; attempt++) {
    const candidate = nextSlugCandidate(safeBase, attempt);
    const where: Where =
      excludeId != null
        ? {
            and: [
              { slug: { equals: candidate } },
              { id: { not_equals: excludeId } },
            ],
          }
        : { slug: { equals: candidate } };

    const existing = await payload.find({
      collection: collection as never,
      where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.docs.length === 0) return candidate;
  }

  return `${safeBase}-${Date.now().toString(36)}`;
}

/**
 * Auto-fill slug from title/name when empty.
 * Never overwrites an existing slug (published URL stability).
 * Manual override still works: owner/dev can set slug explicitly.
 */
export function createAutoSlugBeforeValidate(
  options: AutoSlugOptions
): CollectionBeforeValidateHook {
  const fallback = options.fallback ?? "item";

  return async ({ data, operation, originalDoc, req, collection }) => {
    if (!data) return data;

    const incomingSlug =
      typeof data.slug === "string" ? data.slug.trim() : "";
    const previousSlug =
      originalDoc && typeof (originalDoc as { slug?: unknown }).slug === "string"
        ? String((originalDoc as { slug: string }).slug).trim()
        : "";

    // Keep existing slug unless the editor explicitly cleared it or provided a new one.
    if (incomingSlug) {
      if (!isValidSlug(incomingSlug)) {
        // Normalize a manually entered but messy value when possible.
        const normalized = slugifyTitle(incomingSlug) || fallback;
        data.slug = await resolveUniqueSlug(
          req.payload,
          collection.slug,
          normalized,
          (originalDoc as TypeWithID | undefined)?.id
        );
      } else if (isForbiddenPublicSlug(incomingSlug)) {
        const source =
          typeof data[options.sourceField] === "string"
            ? String(data[options.sourceField])
            : previousSlug;
        const generated = slugifyTitle(source) || fallback;
        data.slug = await resolveUniqueSlug(
          req.payload,
          collection.slug,
          generated,
          (originalDoc as TypeWithID | undefined)?.id
        );
      }
      return data;
    }

    if (operation === "update" && previousSlug && isValidSlug(previousSlug)) {
      // Preserve published/existing URLs when title changes and slug left blank in partial update.
      data.slug = previousSlug;
      return data;
    }

    const sourceRaw = data[options.sourceField];
    const source =
      typeof sourceRaw === "string" && sourceRaw.trim()
        ? sourceRaw
        : typeof (originalDoc as Record<string, unknown> | undefined)?.[
              options.sourceField
            ] === "string"
          ? String(
              (originalDoc as Record<string, unknown>)[options.sourceField]
            )
          : "";

    const generated = slugifyTitle(source) || fallback;
    data.slug = await resolveUniqueSlug(
      req.payload,
      collection.slug,
      generated,
      (originalDoc as TypeWithID | undefined)?.id
    );

    return data;
  };
}

export const SLUG_FIELD_ADMIN = {
  position: "sidebar" as const,
  description:
    "Заполняется автоматически из названия. Меняйте только если нужна особая ссылка на сайте.",
};

export const SLUG_FIELD_LABEL = "Ссылка на сайте";
