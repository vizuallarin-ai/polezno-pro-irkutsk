/**
 * Server-side owner dashboard data aggregation (Payload Local API).
 * Runs inside authenticated admin view — never expose via public endpoints.
 */

import type { Payload } from "payload";
import { getSiteUrl } from "@/lib/site-url";
import {
  buildAttentionItems,
  buildOwnerLaunchReadiness,
  classifyGuideDocs,
  countPublishedReadyDocs,
  type AttentionItem,
  type OwnerDashboardSnapshotInput,
  type OwnerLaunchReadiness,
} from "@/lib/admin/owner-launch-readiness";
import {
  adminCollectionPath,
  adminLeadsDueTodayHref,
  adminLeadsOverdueHref,
  adminLeadsStatusHref,
  adminLeadsUnscheduledHref,
  buildOwnerQuickActions,
  type QuickAction,
} from "@/lib/admin/admin-routes";
import { isDemoPublicMarker } from "@/lib/content-readiness";
import {
  CRM_ACTIVE_SAMPLE_LIMIT,
  activeLeadsWhere,
  summarizeCrmLeads,
} from "@/lib/leads/crm";

const DRAFT_LIMIT = 5;
const READY_SAMPLE = 40;

/** Local API inside authenticated admin view only (never a public route). */
const ADMIN_LOCAL = { overrideAccess: true as const };

export type OwnerDashboardModel = {
  siteUrl: string;
  generatedAt: string;
  queryCount: number;
  readiness: OwnerLaunchReadiness;
  attention: AttentionItem[];
  quickActions: QuickAction[];
  leads: {
    newCount: number;
    overdueCount: number;
    dueTodayCount: number;
    unscheduledCount: number;
    recent: OwnerDashboardSnapshotInput["recentNewLeads"];
    allHref: string;
    newHref: string;
    overdueHref: string;
    dueTodayHref: string;
    unscheduledHref: string;
    sampleCapped: boolean;
    notify: {
      enabled: boolean;
      envConfigured: boolean;
      label: string;
    };
  };
  shelves: {
    excursions: OwnerDashboardSnapshotInput["excursions"];
    routes: OwnerDashboardSnapshotInput["routes"];
    articles: OwnerDashboardSnapshotInput["articles"];
    reviews: OwnerDashboardSnapshotInput["reviews"];
    photos: OwnerDashboardSnapshotInput["photos"];
    guides: OwnerDashboardSnapshotInput["guides"];
  };
  drafts: OwnerDashboardSnapshotInput["recentDrafts"];
  errors: string[];
};

type CountResult = { totalDocs: number };

async function safeCount(
  payload: Payload,
  args: Parameters<Payload["count"]>[0],
  errors: string[],
  label: string
): Promise<number> {
  try {
    const res = (await payload.count(args)) as CountResult;
    return res.totalDocs;
  } catch {
    errors.push(`Не удалось загрузить: ${label}`);
    return 0;
  }
}

async function safeFindDocs(
  payload: Payload,
  args: Parameters<Payload["find"]>[0],
  errors: string[],
  label: string
): Promise<Record<string, unknown>[]> {
  try {
    const res = await payload.find(args);
    return (res.docs ?? []) as unknown as Record<string, unknown>[];
  } catch {
    errors.push(`Не удалось загрузить: ${label}`);
    return [];
  }
}

function docTitle(doc: Record<string, unknown>, fallback: string): string {
  const title =
    (typeof doc.title === "string" && doc.title.trim()) ||
    (typeof doc.name === "string" && doc.name.trim()) ||
    "";
  return title || fallback;
}

function contactFlags(settings: Record<string, unknown> | null): {
  hasPhone: boolean;
  hasEmail: boolean;
  hasTelegram: boolean;
} {
  const contact =
    settings && typeof settings.contact === "object" && settings.contact
      ? (settings.contact as Record<string, unknown>)
      : {};
  const nonEmpty = (v: unknown) =>
    typeof v === "string" && v.trim().length > 0;
  return {
    hasPhone: nonEmpty(contact.phone),
    hasEmail: nonEmpty(contact.email),
    hasTelegram: nonEmpty(contact.telegram),
  };
}

function reviewLooksDemo(doc: Record<string, unknown>): boolean {
  const signals = [doc.author, doc.text, doc.city]
    .filter((v): v is string => typeof v === "string")
    .join(" ");
  return signals.length > 0 && isDemoPublicMarker(signals);
}

/**
 * Query inventory (all parallel via Promise.all):
 * 10 counts + 9 finds + 1 findGlobal ≈ 20 Local API calls.
 * Lead CRM: one active-leads find replaces prior new-count + recent-new find.
 */
export async function fetchOwnerDashboard(
  payload: Payload
): Promise<OwnerDashboardModel> {
  const errors: string[] = [];
  const access = ADMIN_LOCAL;
  let queryCount = 0;
  const track = <T>(p: Promise<T>): Promise<T> => {
    queryCount += 1;
    return p;
  };

  const [
    excursionsPublished,
    excursionsDraft,
    routesPublished,
    routesDraft,
    articlesPublished,
    articlesDraft,
    reviewsPublished,
    reviewsDraft,
    photosPending,
    photosTotal,
    excursionDocs,
    routeDocs,
    articleDocs,
    photoDocs,
    reviewDocs,
    guideDocs,
    draftExcursions,
    draftRoutes,
    draftArticles,
    activeLeadDocs,
    siteSettings,
  ] = await Promise.all([
    track(
      safeCount(
        payload,
        {
          collection: "excursions",
          where: { status: { equals: "published" } },
          ...access,
        },
        errors,
        "экскурсии (опубликованные)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "excursions",
          where: { status: { equals: "draft" } },
          ...access,
        },
        errors,
        "экскурсии (черновики)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "routes",
          where: { status: { equals: "published" } },
          ...access,
        },
        errors,
        "маршруты (опубликованные)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "routes",
          where: { status: { equals: "draft" } },
          ...access,
        },
        errors,
        "маршруты (черновики)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "articles",
          where: { status: { equals: "published" } },
          ...access,
        },
        errors,
        "статьи (опубликованные)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "articles",
          where: { status: { equals: "draft" } },
          ...access,
        },
        errors,
        "статьи (черновики)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "reviews",
          where: { status: { equals: "published" } },
          ...access,
        },
        errors,
        "отзывы (опубликованные)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "reviews",
          where: { status: { equals: "draft" } },
          ...access,
        },
        errors,
        "отзывы (черновики)"
      )
    ),
    track(
      safeCount(
        payload,
        {
          collection: "photos",
          where: { moderationStatus: { equals: "pending" } },
          ...access,
        },
        errors,
        "фото на модерации"
      )
    ),
    track(
      safeCount(
        payload,
        { collection: "photos", ...access },
        errors,
        "фото (всего)"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "excursions",
          where: { status: { equals: "published" } },
          limit: READY_SAMPLE,
          depth: 0,
          ...access,
        },
        errors,
        "экскурсии (проверка готовности)"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "routes",
          where: { status: { equals: "published" } },
          limit: READY_SAMPLE,
          depth: 0,
          ...access,
        },
        errors,
        "маршруты (проверка готовности)"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "articles",
          where: { status: { equals: "published" } },
          limit: READY_SAMPLE,
          depth: 0,
          ...access,
        },
        errors,
        "статьи (проверка готовности)"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "photos",
          where: {
            and: [
              { status: { equals: "published" } },
              { moderationStatus: { equals: "approved" } },
            ],
          },
          limit: READY_SAMPLE,
          depth: 1,
          ...access,
        },
        errors,
        "фото (проверка готовности)"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "reviews",
          where: { status: { equals: "published" } },
          limit: READY_SAMPLE,
          depth: 0,
          ...access,
        },
        errors,
        "отзывы (проверка готовности)"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "guides",
          limit: READY_SAMPLE,
          depth: 0,
          ...access,
        },
        errors,
        "гиды"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "excursions",
          where: { status: { equals: "draft" } },
          limit: DRAFT_LIMIT,
          depth: 0,
          sort: "-updatedAt",
          ...access,
        },
        errors,
        "черновики экскурсий"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "routes",
          where: { status: { equals: "draft" } },
          limit: DRAFT_LIMIT,
          depth: 0,
          sort: "-updatedAt",
          ...access,
        },
        errors,
        "черновики маршрутов"
      )
    ),
    track(
      safeFindDocs(
        payload,
        {
          collection: "articles",
          where: { status: { equals: "draft" } },
          limit: DRAFT_LIMIT,
          depth: 0,
          sort: "-updatedAt",
          ...access,
        },
        errors,
        "черновики статей"
      )
    ),
    track(
      safeFindActiveLeads(payload, errors)
    ),
    (async () => {
      queryCount += 1;
      try {
        const global = await payload.findGlobal({
          slug: "site-settings",
          depth: 0,
          ...access,
        });
        return global as unknown as Record<string, unknown>;
      } catch {
        errors.push("Не удалось загрузить: профиль / контакты");
        return null;
      }
    })(),
  ]);

  const crm = summarizeCrmLeads(
    activeLeadDocs.docs.map((doc) => ({
      id: doc.id as string | number,
      name: doc.name,
      status: doc.status,
      nextContactAt: doc.nextContactAt,
      createdAt: doc.createdAt,
      requestType: doc.requestType,
    })),
    {
      totalDocs: activeLeadDocs.totalDocs,
      sampleLimit: CRM_ACTIVE_SAMPLE_LIMIT,
    }
  );

  const guideStats = classifyGuideDocs(guideDocs);
  const reviewsReady = reviewDocs.filter((doc) => !reviewLooksDemo(doc)).length;

  const leadSettings =
    siteSettings &&
    typeof siteSettings.leadSettings === "object" &&
    siteSettings.leadSettings
      ? (siteSettings.leadSettings as Record<string, unknown>)
      : {};
  const notifyEnabled = leadSettings.leadNotificationEnabled !== false;
  const envConfigured = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.EMAIL_FROM?.trim() &&
      process.env.EMAIL_TO?.trim()
  );
  const notifyLabel = !notifyEnabled
    ? "Уведомления выключены в настройках"
    : envConfigured
      ? "Уведомления о заявках настроены"
      : "Уведомления не настроены (нет Resend/EMAIL_*)";

  const snapshot: OwnerDashboardSnapshotInput = {
    leadsNew: crm.newCount,
    leadsOverdue: crm.overdueCount,
    leadsDueToday: crm.dueTodayCount,
    leadsUnscheduled: crm.unscheduledCount,
    recentNewLeads: crm.recentNew,
    leadNotify: { enabled: notifyEnabled, envConfigured },
    excursions: {
      published: excursionsPublished,
      drafts: excursionsDraft,
      publishedReady: countPublishedReadyDocs("excursion", excursionDocs),
    },
    routes: {
      published: routesPublished,
      drafts: routesDraft,
      publishedReady: countPublishedReadyDocs("route", routeDocs),
    },
    articles: {
      published: articlesPublished,
      drafts: articlesDraft,
      // Counts use admin `status`. Public also gates on `_status` when set — ADMIN.E.
      publishedReady: countPublishedReadyDocs("article", articleDocs),
    },
    reviews: {
      published: reviewsPublished,
      drafts: reviewsDraft,
      publishedReady: reviewsReady,
    },
    photos: {
      total: photosTotal,
      publishedReady: countPublishedReadyDocs("photo", photoDocs),
      pendingModeration: photosPending,
    },
    guides: {
      total: guideDocs.length,
      publicReady: guideStats.publicReady,
      hasPlaceholder: guideStats.hasPlaceholder,
      placeholderId: guideStats.placeholderId,
    },
    contacts: contactFlags(siteSettings),
    recentDrafts: [
      ...draftExcursions.map((doc) => ({
        id: doc.id as string | number,
        collection: "excursions" as const,
        title: docTitle(doc, "Экскурсия без названия"),
        updatedAt:
          typeof doc.updatedAt === "string" ? doc.updatedAt : null,
      })),
      ...draftRoutes.map((doc) => ({
        id: doc.id as string | number,
        collection: "routes" as const,
        title: docTitle(doc, "Маршрут без названия"),
        updatedAt:
          typeof doc.updatedAt === "string" ? doc.updatedAt : null,
      })),
      ...draftArticles.map((doc) => ({
        id: doc.id as string | number,
        collection: "articles" as const,
        title: docTitle(doc, "Статья без названия"),
        updatedAt:
          typeof doc.updatedAt === "string" ? doc.updatedAt : null,
      })),
    ]
      .sort((a, b) => {
        const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return tb - ta;
      })
      .slice(0, 8),
  };

  const readiness = buildOwnerLaunchReadiness(snapshot);
  const attention = buildAttentionItems(snapshot, readiness);
  const siteUrl = getSiteUrl();

  return {
    siteUrl,
    generatedAt: new Date().toISOString(),
    queryCount,
    readiness,
    attention,
    quickActions: buildOwnerQuickActions(siteUrl),
    leads: {
      newCount: crm.newCount,
      overdueCount: crm.overdueCount,
      dueTodayCount: crm.dueTodayCount,
      unscheduledCount: crm.unscheduledCount,
      recent: snapshot.recentNewLeads,
      allHref: adminCollectionPath("leads"),
      newHref: adminLeadsStatusHref("new"),
      overdueHref: adminLeadsOverdueHref(),
      dueTodayHref: adminLeadsDueTodayHref(),
      unscheduledHref: adminLeadsUnscheduledHref(),
      sampleCapped: crm.sampleCapped,
      notify: {
        enabled: notifyEnabled,
        envConfigured,
        label: notifyLabel,
      },
    },
    shelves: {
      excursions: snapshot.excursions,
      routes: snapshot.routes,
      articles: snapshot.articles,
      reviews: snapshot.reviews,
      photos: snapshot.photos,
      guides: snapshot.guides,
    },
    drafts: snapshot.recentDrafts,
    errors,
  };
}

async function safeFindActiveLeads(
  payload: Payload,
  errors: string[]
): Promise<{ docs: Record<string, unknown>[]; totalDocs: number }> {
  try {
    const res = await payload.find({
      collection: "leads",
      where: activeLeadsWhere(),
      limit: CRM_ACTIVE_SAMPLE_LIMIT,
      depth: 0,
      sort: "-createdAt",
      ...ADMIN_LOCAL,
    });
    return {
      docs: (res.docs ?? []) as unknown as Record<string, unknown>[],
      totalDocs: res.totalDocs ?? (res.docs?.length ?? 0),
    };
  } catch {
    errors.push("Не удалось загрузить: активные заявки (CRM)");
    return { docs: [], totalDocs: 0 };
  }
}
