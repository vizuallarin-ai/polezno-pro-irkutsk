import type { Access, AccessArgs, FieldAccess, Where } from "payload";
import { PHOTO_PUBLISHED_WHERE } from "@/lib/cms-filters";

type UserWithRole = { role?: "admin" | "editor" | null };

export const isAdmin = ({ req: { user } }: AccessArgs): boolean =>
  (user as UserWithRole | null)?.role === "admin";

export const isStaff = ({ req: { user } }: AccessArgs): boolean => {
  const role = (user as UserWithRole | null)?.role;
  return role === "admin" || role === "editor";
};

/** Доступ к панели /admin — только администраторы (boolean). */
export const adminPanelAccess = ({ req: { user } }: AccessArgs): boolean =>
  (user as UserWithRole | null)?.role === "admin";

/** CRUD контента — только администраторы. */
export const adminCrud: Access = isAdmin;

export const adminFieldAccess: FieldAccess = isAdmin;

/** Публичное чтение опубликованного или полный доступ для staff. */
export const publishedOrStaff = (
  statusField = "status"
): Access =>
  ({ req: { user } }) => {
    if (isStaff({ req: { user } } as AccessArgs)) return true;
    return { [statusField]: { equals: "published" } };
  };

/**
 * Orphan / system collections: no anonymous REST dump.
 * Local API with overrideAccess still works for trusted server code.
 */
export const staffOnlyRead: Access = ({ req: { user } }) =>
  isStaff({ req: { user } } as AccessArgs);

/** Featured reviews: public only when status=published (ADMIN.B). */
export const reviewReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as AccessArgs)) return true;
  return { status: { equals: "published" } };
};

/**
 * Guides: public only active profiles, excluding known placeholder slugs.
 * Frontend also fail-closes via content-readiness.
 */
export const guideReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as AccessArgs)) return true;
  const where: Where = {
    and: [
      { isActive: { equals: true } },
      { slug: { not_equals: "Slug" } },
      { slug: { not_equals: "slug" } },
      { slug: { not_equals: "placeholder" } },
      { slug: { not_equals: "guide" } },
    ],
  };
  return where;
};

const ARTICLE_PUBLIC_WHERE: Where = {
  and: [
    { _status: { equals: "published" } },
    { status: { equals: "published" } },
  ],
};

/** Статьи с drafts: staff видит всё, публично — только published. */
export const articleReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as AccessArgs)) return true;
  return ARTICLE_PUBLIC_WHERE;
};

export const leadsReadAccess: Access = isAdmin;
export const leadsUpdateAccess: Access = isAdmin;
export const leadsDeleteAccess: Access = isAdmin;
/** Create only via trusted Local API (`overrideAccess`) after spam checks — not public REST/GraphQL. */
export const leadsCreateAccess: Access = isAdmin;

/** Public may read only media marked visibility=public; staff sees all. */
export const mediaReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as AccessArgs)) return true;
  return { visibility: { equals: "public" } };
};
export const mediaWriteAccess: Access = isAdmin;

/** Публично — только опубликованные и одобренные фото. */
export const photoReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as AccessArgs)) return true;
  return PHOTO_PUBLISHED_WHERE;
};
