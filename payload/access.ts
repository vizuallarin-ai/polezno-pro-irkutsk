import type { Access, AccessArgs, FieldAccess } from "payload";

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

/** Статьи с drafts: staff видит всё, публично — только published. */
export const articleReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as AccessArgs)) return true;
  return { _status: { equals: "published" } };
};

export const leadsReadAccess: Access = isAdmin;
export const leadsUpdateAccess: Access = isAdmin;
export const leadsDeleteAccess: Access = isAdmin;
export const leadsCreateAccess: Access = () => true;

export const mediaReadAccess: Access = () => true;
export const mediaWriteAccess: Access = isAdmin;
