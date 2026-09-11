/**
 * Canonical CMS role model (ADMIN.E).
 *
 * Machine values stay stable for backward compatibility:
 * - `admin`     → Owner (владелец)
 * - `editor`    → Content Editor (контент-редактор)
 * - `developer` → Developer (технический доступ)
 */

export const CMS_ROLES = ["admin", "editor", "developer"] as const;

export type CmsRole = (typeof CMS_ROLES)[number];

export type UserWithRole = {
  id?: string | number;
  role?: CmsRole | null;
  email?: string | null;
};

export function roleOf(user: UserWithRole | null | undefined): CmsRole | null {
  const role = user?.role;
  if (role === "admin" || role === "editor" || role === "developer") return role;
  return null;
}

export function isOwnerRole(role: CmsRole | null | undefined): boolean {
  return role === "admin";
}

export function isContentEditorRole(role: CmsRole | null | undefined): boolean {
  return role === "editor";
}

export function isDeveloperRole(role: CmsRole | null | undefined): boolean {
  return role === "developer";
}

/** Privileged operators who must not all be deleted (lockout guard). */
export function isPrivilegedRole(role: CmsRole | null | undefined): boolean {
  return role === "admin" || role === "developer";
}

export const ROLE_OPTIONS: { label: string; value: CmsRole }[] = [
  {
    label: "Владелец (основной доступ к контенту и заявкам)",
    value: "admin",
  },
  {
    label: "Контент-редактор (только редакционный контент)",
    value: "editor",
  },
  {
    label: "Разработчик (технический полный доступ)",
    value: "developer",
  },
];
