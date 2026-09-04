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
