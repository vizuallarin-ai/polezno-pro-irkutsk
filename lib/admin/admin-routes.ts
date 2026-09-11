/**
 * Payload Admin route helpers — keep dashboard / CTA links consistent.
 * Collection API slugs are stable; UI labels may change.
 */

import {
  ACTIVE_LEAD_STATUSES,
  OWNER_TIMEZONE,
  UNSCHEDULED_SIGNAL_STATUSES,
  calendarDateInTimeZone,
  type LeadCrmStatus,
} from "@/lib/leads/crm";

export const ADMIN_BASE = "/admin";

export type OwnerCollectionSlug =
  | "leads"
  | "excursions"
  | "routes"
  | "articles"
  | "photos"
  | "reviews"
  | "guides"
  | "events"
  | "products"
  | "makers"
  | "ar-postcards"
  | "media"
  | "users";

export type OwnerGlobalSlug = "site-settings" | "navigation";

export function adminHomePath(): string {
  return ADMIN_BASE;
}

export function adminCollectionPath(slug: OwnerCollectionSlug): string {
  return `${ADMIN_BASE}/collections/${slug}`;
}

export function adminCreatePath(slug: OwnerCollectionSlug): string {
  return `${adminCollectionPath(slug)}/create`;
}

export function adminEditPath(
  slug: OwnerCollectionSlug,
  id: string | number
): string {
  return `${adminCollectionPath(slug)}/${id}`;
}

export function adminGlobalPath(slug: OwnerGlobalSlug): string {
  return `${ADMIN_BASE}/globals/${slug}`;
}

/** Filter helpers for list views (Payload where-query URL shape). */
export function adminCollectionWhereEquals(
  slug: OwnerCollectionSlug,
  field: string,
  value: string
): string {
  return `${adminCollectionPath(slug)}?where[${field}][equals]=${encodeURIComponent(value)}`;
}

export function adminLeadsStatusHref(status: LeadCrmStatus): string {
  return adminCollectionWhereEquals("leads", "status", status);
}

/** Start of calendar day in owner TZ as UTC ISO (approximation for admin URL filter). */
function ownerDayBoundsUtc(
  now: Date = new Date(),
  timeZone: string = OWNER_TIMEZONE
): { startIso: string; endIso: string } {
  const ymd = calendarDateInTimeZone(now, timeZone);
  // Irkutsk is fixed UTC+8 (no DST). Bounds expressed as UTC instants.
  const startIso = `${ymd}T00:00:00.000+08:00`;
  const endIso = `${ymd}T23:59:59.999+08:00`;
  return {
    startIso: new Date(startIso).toISOString(),
    endIso: new Date(endIso).toISOString(),
  };
}

function leadsAndQuery(parts: string[]): string {
  return `${adminCollectionPath("leads")}?${parts.join("&")}`;
}

function statusInClause(
  statuses: readonly string[],
  andIndex: number
): string[] {
  return statuses.map(
    (s, i) =>
      `where[and][${andIndex}][status][in][${i}]=${encodeURIComponent(s)}`
  );
}

export function adminLeadsOverdueHref(now: Date = new Date()): string {
  return leadsAndQuery([
    ...statusInClause(ACTIVE_LEAD_STATUSES, 0),
    `where[and][1][nextContactAt][less_than]=${encodeURIComponent(now.toISOString())}`,
  ]);
}

export function adminLeadsDueTodayHref(now: Date = new Date()): string {
  const { startIso, endIso } = ownerDayBoundsUtc(now);
  return leadsAndQuery([
    ...statusInClause(ACTIVE_LEAD_STATUSES, 0),
    `where[and][1][nextContactAt][greater_than_equal]=${encodeURIComponent(startIso)}`,
    `where[and][2][nextContactAt][less_than_equal]=${encodeURIComponent(endIso)}`,
  ]);
}

export function adminLeadsUnscheduledHref(): string {
  return leadsAndQuery([
    ...statusInClause(UNSCHEDULED_SIGNAL_STATUSES, 0),
    "where[and][1][nextContactAt][exists]=false",
  ]);
}

export type QuickAction = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

export function buildOwnerQuickActions(siteUrl: string): QuickAction[] {
  return [
    {
      id: "create-excursion",
      label: "Добавить экскурсию",
      href: adminCreatePath("excursions"),
    },
    {
      id: "create-route",
      label: "Добавить маршрут",
      href: adminCreatePath("routes"),
    },
    {
      id: "create-article",
      label: "Добавить статью",
      href: adminCreatePath("articles"),
    },
    {
      id: "create-photo",
      label: "Добавить фото",
      href: adminCreatePath("photos"),
    },
    {
      id: "create-review",
      label: "Добавить отзыв",
      href: adminCreatePath("reviews"),
    },
    {
      id: "open-leads",
      label: "Открыть заявки",
      href: adminCollectionPath("leads"),
    },
    {
      id: "edit-profile",
      label: "Настроить профиль",
      href: adminGlobalPath("site-settings"),
    },
    {
      id: "open-site",
      label: "Открыть сайт",
      href: siteUrl,
      external: true,
    },
  ];
}
