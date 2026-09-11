/**
 * Canonical publish checklist for excursions / routes.
 * Server hooks (ADMIN.B) and admin UI hints (ADMIN.C) share this module.
 * Source of truth for blocking rules remains the thrown Error messages used by hooks.
 */

export type PublishChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
};

export type PublishChecklistResult = {
  items: PublishChecklistItem[];
  ready: boolean;
  /** Human messages matching server-side guard errors (blocking only). */
  blockingMessages: string[];
};

type PointLike = {
  lat?: number | null;
  lng?: number | null;
  published?: boolean | null;
};

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object") return data as Record<string, unknown>;
  return null;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function usableRoutePoints(doc: Record<string, unknown>): PointLike[] {
  const points = Array.isArray(doc.routePoints)
    ? (doc.routePoints as PointLike[])
    : [];
  return points.filter(
    (p) =>
      p &&
      p.published !== false &&
      typeof p.lat === "number" &&
      typeof p.lng === "number" &&
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng)
  );
}

/** Evaluate excursion fields against ADMIN.B publish guard rules. */
export function evaluateExcursionPublish(
  data: unknown
): PublishChecklistResult {
  const doc = asRecord(data) ?? {};
  const title =
    typeof doc.title === "string" ? doc.title.trim() : "";
  const shortDescription =
    typeof doc.shortDescription === "string"
      ? doc.shortDescription.trim()
      : "";
  const priceOnRequest = Boolean(doc.priceOnRequest);
  const price = numOrNull(doc.price);
  const duration = numOrNull(doc.duration);
  const hasPrice = priceOnRequest || (price != null && price > 0);
  const hasDuration = duration != null && duration > 0;

  const items: PublishChecklistItem[] = [
    { id: "title", label: "Название", ok: title.length > 0 },
    {
      id: "shortDescription",
      label: "Краткое описание",
      ok: shortDescription.length > 0,
    },
    {
      id: "price",
      label: "Цена или «по запросу»",
      ok: hasPrice,
    },
    {
      id: "duration",
      label: "Длительность (минуты)",
      ok: hasDuration,
    },
  ];

  const blockingMessages: string[] = [];
  if (!hasPrice) {
    blockingMessages.push(
      "Нельзя опубликовать экскурсию без цены. Укажите цену в рублях или отметьте «Цена по запросу»."
    );
  }
  if (!hasDuration) {
    blockingMessages.push(
      "Нельзя опубликовать экскурсию без длительности. Укажите длительность в минутах."
    );
  }
  if (!shortDescription) {
    blockingMessages.push(
      "Нельзя опубликовать экскурсию без краткого описания."
    );
  }

  return {
    items,
    ready: blockingMessages.length === 0 && title.length > 0,
    blockingMessages,
  };
}

/** Evaluate route fields against ADMIN.B publish guard rules. */
export function evaluateRoutePublish(data: unknown): PublishChecklistResult {
  const doc = asRecord(data) ?? {};
  const title =
    typeof doc.title === "string" ? doc.title.trim() : "";
  const description =
    typeof doc.description === "string" ? doc.description.trim() : "";
  const points = usableRoutePoints(doc);
  const isPaid = doc.type === "paid";
  const price = numOrNull(doc.price);
  const hasPaidPrice = !isPaid || (price != null && price > 0);

  const items: PublishChecklistItem[] = [
    { id: "title", label: "Название", ok: title.length > 0 },
    {
      id: "description",
      label: "Краткое описание",
      ok: description.length > 0,
    },
    {
      id: "points",
      label: "Точка на карте с координатами",
      ok: points.length > 0,
    },
  ];

  if (isPaid) {
    items.push({
      id: "price",
      label: "Цена (для платного маршрута)",
      ok: hasPaidPrice,
    });
  }

  const blockingMessages: string[] = [];
  if (!description) {
    blockingMessages.push(
      "Нельзя опубликовать маршрут без краткого описания."
    );
  }
  if (points.length === 0) {
    blockingMessages.push(
      "Нельзя опубликовать маршрут без точек на карте. Добавьте хотя бы одну точку с координатами (широта и долгота)."
    );
  }
  if (isPaid && !hasPaidPrice) {
    blockingMessages.push(
      "Для платного маршрута укажите цену в рублях перед публикацией."
    );
  }

  return {
    items,
    ready: blockingMessages.length === 0 && title.length > 0,
    blockingMessages,
  };
}
