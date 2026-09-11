/**
 * Payload Admin route helpers — keep dashboard / CTA links consistent.
 * Collection API slugs are stable; UI labels may change.
 */

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
