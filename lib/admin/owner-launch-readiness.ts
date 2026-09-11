/**
 * Owner launch readiness + attention items for Payload Admin dashboard (ADMIN.C).
 *
 * Reuses `lib/content-readiness.ts` for commercial publish-ready classification.
 * Does NOT invent a second public-surface engine.
 *
 * Criteria aligned with CONTENT.0 minimum launch pack:
 * 1 flagship excursion · 1 route · 1 guide · 1 real review · 3–5 photos · contacts
 * Demo products/AR never mark the project “ready”.
 */

import {
  commercialInputFromDoc,
  isGuidePlaceholderProfile,
  isPublicPublishedReady,
  type CommercialKind,
} from "@/lib/content-readiness";
import {
  adminCollectionPath,
  adminCollectionWhereEquals,
  adminCreatePath,
  adminEditPath,
  adminGlobalPath,
} from "@/lib/admin/admin-routes";

export type ReadinessSeverity = "critical" | "high" | "medium" | "info";

export type ReadinessState = "ok" | "warn" | "fail" | "unknown";

export type OwnerReadinessCriterionId =
  | "contacts"
  | "excursion"
  | "route"
  | "guide"
  | "reviews"
  | "photos";

export type OwnerReadinessCriterion = {
  id: OwnerReadinessCriterionId;
  label: string;
  state: ReadinessState;
  detail: string;
  href: string;
  cta: string;
};

export type AttentionItem = {
  id: string;
  severity: ReadinessSeverity;
  title: string;
  detail: string;
  href: string;
  cta: string;
};

export type ContentShelfCounts = {
  published: number;
  drafts: number;
  /** Published + classified published-ready (excludes demo/incomplete). */
  publishedReady: number;
};

export type OwnerDashboardSnapshotInput = {
  leadsNew: number;
  recentNewLeads: Array<{
    id: string | number;
    name: string;
    createdAt?: string | null;
    requestType?: string | null;
  }>;
  excursions: ContentShelfCounts;
  routes: ContentShelfCounts;
  articles: ContentShelfCounts;
  reviews: {
    published: number;
    drafts: number;
    publishedReady: number;
  };
  photos: {
    total: number;
    publishedReady: number;
    pendingModeration: number;
  };
  guides: {
    total: number;
    publicReady: number;
    hasPlaceholder: boolean;
    placeholderId?: string | number | null;
  };
  contacts: {
    hasPhone: boolean;
    hasEmail: boolean;
    hasTelegram: boolean;
  };
  recentDrafts: Array<{
    id: string | number;
    collection: "excursions" | "routes" | "articles";
    title: string;
    updatedAt?: string | null;
  }>;
};

export type OwnerLaunchReadiness = {
  criteria: OwnerReadinessCriterion[];
  allCriticalOk: boolean;
  /** Transparent: ok / total of launch criteria (not a vanity %). */
  okCount: number;
  totalCount: number;
};

const PHOTO_MIN = 3;

export function contactsFilled(contact: {
  hasPhone: boolean;
  hasEmail: boolean;
  hasTelegram: boolean;
}): boolean {
  return contact.hasPhone || contact.hasEmail || contact.hasTelegram;
}

export function countPublishedReadyDocs(
  kind: CommercialKind,
  docs: Record<string, unknown>[]
): number {
  return docs.filter((doc) =>
    isPublicPublishedReady(commercialInputFromDoc(kind, doc))
  ).length;
}

export function classifyGuideDocs(docs: Record<string, unknown>[]): {
  publicReady: number;
  hasPlaceholder: boolean;
  placeholderId: string | number | null;
} {
  let publicReady = 0;
  let hasPlaceholder = false;
  let placeholderId: string | number | null = null;

  for (const doc of docs) {
    const input = commercialInputFromDoc("guide", doc);
    if (isPublicPublishedReady(input)) publicReady += 1;
    if (
      isGuidePlaceholderProfile({
        name: input.name,
        title: input.title,
        slug: input.slug,
      })
    ) {
      hasPlaceholder = true;
      if (placeholderId == null && doc.id != null) {
        placeholderId = doc.id as string | number;
      }
    }
  }

  return { publicReady, hasPlaceholder, placeholderId };
}

export function buildOwnerLaunchReadiness(
  input: OwnerDashboardSnapshotInput
): OwnerLaunchReadiness {
  const contactsOk = contactsFilled(input.contacts);
  const excursionOk = input.excursions.publishedReady > 0;
  const routeOk = input.routes.publishedReady > 0;
  const guideOk =
    input.guides.publicReady > 0 && !input.guides.hasPlaceholder;
  const reviewsOk = input.reviews.publishedReady > 0;
  const photosOk = input.photos.publishedReady >= PHOTO_MIN;

  const criteria: OwnerReadinessCriterion[] = [
    {
      id: "contacts",
      label: "Контакты заполнены",
      state: contactsOk ? "ok" : "fail",
      detail: contactsOk
        ? "Есть телефон, email или Telegram"
        : "Укажите хотя бы один способ связи",
      href: adminGlobalPath("site-settings"),
      cta: "Открыть профиль",
    },
    {
      id: "excursion",
      label: "Есть опубликованная экскурсия",
      state: excursionOk ? "ok" : "fail",
      detail: excursionOk
        ? `Готовых к показу: ${input.excursions.publishedReady}`
        : "Нужна флагманская экскурсия для запуска продаж",
      href:
        input.excursions.publishedReady > 0
          ? adminCollectionPath("excursions")
          : adminCreatePath("excursions"),
      cta: excursionOk ? "Открыть экскурсии" : "Добавить экскурсию",
    },
    {
      id: "route",
      label: "Есть опубликованный маршрут",
      state: routeOk ? "ok" : "fail",
      detail: routeOk
        ? `Готовых к показу: ${input.routes.publishedReady}`
        : "Нужен хотя бы один маршрут на карте",
      href: routeOk
        ? adminCollectionPath("routes")
        : adminCreatePath("routes"),
      cta: routeOk ? "Открыть маршруты" : "Добавить маршрут",
    },
    {
      id: "guide",
      label: "Профиль гида готов",
      state: guideOk ? "ok" : input.guides.hasPlaceholder ? "fail" : "fail",
      detail: guideOk
        ? "Публичный профиль заполнен"
        : input.guides.hasPlaceholder
          ? "Профиль гида ещё не готов (заглушка)"
          : "Нет активного заполненного профиля",
      href:
        input.guides.placeholderId != null
          ? adminEditPath("guides", input.guides.placeholderId)
          : adminCollectionPath("guides"),
      cta: "Открыть профиль",
    },
    {
      id: "reviews",
      label: "Есть отзывы",
      state: reviewsOk ? "ok" : "fail",
      detail: reviewsOk
        ? `Опубликовано: ${input.reviews.publishedReady}`
        : "Нужен хотя бы один реальный отзыв (или осознанный отказ — CONTENT.1)",
      href: reviewsOk
        ? adminCollectionPath("reviews")
        : adminCreatePath("reviews"),
      cta: reviewsOk ? "Открыть отзывы" : "Добавить отзыв",
    },
    {
      id: "photos",
      label: `Фотографии (минимум ${PHOTO_MIN})`,
      state: photosOk
        ? "ok"
        : input.photos.publishedReady > 0
          ? "warn"
          : "fail",
      detail:
        input.photos.publishedReady >= PHOTO_MIN
          ? `Готово: ${input.photos.publishedReady}`
          : input.photos.publishedReady > 0
            ? `Сейчас ${input.photos.publishedReady} — желательно ${PHOTO_MIN}–5`
            : "Нужно 3–5 фотографий с правами на публикацию",
      href: adminCollectionPath("photos"),
      cta: "Открыть фото",
    },
  ];

  const okCount = criteria.filter((c) => c.state === "ok").length;

  return {
    criteria,
    allCriticalOk: criteria.every((c) => c.state === "ok"),
    okCount,
    totalCount: criteria.length,
  };
}

/**
 * Actionable attention list. Order: severity then product priority.
 * Demo souvenirs/AR never produce “project ready” attention greens.
 */
export function buildAttentionItems(
  input: OwnerDashboardSnapshotInput,
  readiness: OwnerLaunchReadiness
): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (input.leadsNew > 0) {
    items.push({
      id: "leads-new",
      severity: "high",
      title:
        input.leadsNew === 1
          ? "Есть новая заявка"
          : `Новых заявок: ${input.leadsNew}`,
      detail: "Ответьте гостю, пока заявка свежая",
      href: adminCollectionWhereEquals("leads", "status", "new"),
      cta: "Открыть заявки",
    });
  }

  for (const c of readiness.criteria) {
    if (c.state === "ok") continue;
    const severity: ReadinessSeverity =
      c.state === "warn" ? "medium" : c.id === "contacts" || c.id === "excursion" || c.id === "route"
        ? "critical"
        : "high";
    items.push({
      id: `readiness-${c.id}`,
      severity,
      title:
        c.id === "excursion"
          ? "Нет опубликованной экскурсии"
          : c.id === "route"
            ? "Нет опубликованного маршрута"
            : c.id === "guide"
              ? "Профиль гида не готов"
              : c.id === "contacts"
                ? "Не заполнены контакты"
                : c.id === "reviews"
                  ? "Нет опубликованных отзывов"
                  : "Недостаточно фотографий",
      detail: c.detail,
      href: c.href,
      cta: c.cta,
    });
  }

  if (input.photos.pendingModeration > 0) {
    items.push({
      id: "photos-pending",
      severity: "medium",
      title: `Фото на модерации: ${input.photos.pendingModeration}`,
      detail: "Проверьте права и опубликуйте подходящие снимки",
      href: adminCollectionWhereEquals(
        "photos",
        "moderationStatus",
        "pending"
      ),
      cta: "Открыть модерацию",
    });
  }

  const draftCount =
    input.excursions.drafts + input.routes.drafts + input.articles.drafts;
  if (draftCount > 0 && input.recentDrafts.length > 0) {
    items.push({
      id: "drafts-open",
      severity: "medium",
      title: `Черновики: ${draftCount}`,
      detail: "Есть начатые материалы — можно продолжить",
      href: adminCollectionWhereEquals("excursions", "status", "draft"),
      cta: "Смотреть черновики",
    });
  }

  const severityRank: Record<ReadinessSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    info: 3,
  };

  return items.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity]
  );
}

/** Never treat demo catalog fullness as launch-ready. */
export function isFalseReadyGuard(input: {
  productsPublished?: number;
  arPublished?: number;
  excursionsPublishedReady: number;
  routesPublishedReady: number;
}): boolean {
  const demoOnly =
    (input.productsPublished ?? 0) + (input.arPublished ?? 0) > 0 &&
    input.excursionsPublishedReady === 0 &&
    input.routesPublishedReady === 0;
  return demoOnly;
}
