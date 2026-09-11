import type { CollectionBeforeValidateHook } from "payload";

type PointLike = {
  lat?: number | null;
  lng?: number | null;
  published?: boolean | null;
};

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object") return data as Record<string, unknown>;
  return null;
}

/**
 * Commercial publish guard for excursions.
 * Drafts may be incomplete; published offers must have honest pricing + duration.
 */
export const excursionPublishGuardBeforeValidate: CollectionBeforeValidateHook =
  ({ data }) => {
    const doc = asRecord(data);
    if (!doc) return data;
    if (doc.status !== "published") return data;

    const priceOnRequest = Boolean(doc.priceOnRequest);
    const price =
      doc.price == null || doc.price === ""
        ? null
        : Number(doc.price);

    if (!priceOnRequest) {
      if (price == null || Number.isNaN(price) || price <= 0) {
        throw new Error(
          "Нельзя опубликовать экскурсию без цены. Укажите цену в рублях или отметьте «Цена по запросу»."
        );
      }
    }

    const duration =
      doc.duration == null || doc.duration === ""
        ? null
        : Number(doc.duration);
    if (duration == null || Number.isNaN(duration) || duration <= 0) {
      throw new Error(
        "Нельзя опубликовать экскурсию без длительности. Укажите длительность в минутах."
      );
    }

    const shortDescription =
      typeof doc.shortDescription === "string"
        ? doc.shortDescription.trim()
        : "";
    if (!shortDescription) {
      throw new Error(
        "Нельзя опубликовать экскурсию без краткого описания."
      );
    }

    return data;
  };

/**
 * Minimal publish guard for routes: description + at least one map point.
 * Paid routes must have a price.
 */
export const routePublishGuardBeforeValidate: CollectionBeforeValidateHook = ({
  data,
}) => {
  const doc = asRecord(data);
  if (!doc) return data;
  if (doc.status !== "published") return data;

  const description =
    typeof doc.description === "string" ? doc.description.trim() : "";
  if (!description) {
    throw new Error("Нельзя опубликовать маршрут без краткого описания.");
  }

  const points = Array.isArray(doc.routePoints)
    ? (doc.routePoints as PointLike[])
    : [];
  const usablePoints = points.filter(
    (p) =>
      p &&
      p.published !== false &&
      typeof p.lat === "number" &&
      typeof p.lng === "number" &&
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng)
  );

  if (usablePoints.length === 0) {
    throw new Error(
      "Нельзя опубликовать маршрут без точек на карте. Добавьте хотя бы одну точку с координатами (широта и долгота)."
    );
  }

  if (doc.type === "paid") {
    const price =
      doc.price == null || doc.price === "" ? null : Number(doc.price);
    if (price == null || Number.isNaN(price) || price <= 0) {
      throw new Error(
        "Для платного маршрута укажите цену в рублях перед публикацией."
      );
    }
  }

  return data;
};

/**
 * Guides: incomplete / placeholder profiles cannot be marked active for public.
 */
export const guidePublicSafetyBeforeValidate: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const doc = asRecord(data);
  if (!doc) return data;

  const slug =
    typeof doc.slug === "string"
      ? doc.slug.trim().toLowerCase()
      : typeof (originalDoc as { slug?: string } | undefined)?.slug === "string"
        ? String((originalDoc as { slug: string }).slug).trim().toLowerCase()
        : "";

  const name =
    typeof doc.name === "string"
      ? doc.name.trim().toLowerCase()
      : typeof (originalDoc as { name?: string } | undefined)?.name === "string"
        ? String((originalDoc as { name: string }).name).trim().toLowerCase()
        : "";

  const placeholderSlugs = new Set([
    "slug",
    "guide",
    "placeholder",
    "name",
    "test",
    "demo-guide",
  ]);
  const placeholderNames = new Set([
    "имя гида",
    "гид",
    "name",
    "guide",
    "placeholder",
  ]);

  const isPlaceholder =
    placeholderSlugs.has(slug) || placeholderNames.has(name);

  if (isPlaceholder) {
    if (doc.isActive === true) {
      throw new Error(
        "Нельзя показать на сайте незаполненный профиль гида (placeholder). Заполните имя и ссылку, либо оставьте профиль выключенным."
      );
    }
    doc.isActive = false;
  }

  return data;
};
