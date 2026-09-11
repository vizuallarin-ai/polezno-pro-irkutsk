/**
 * Canonical Payload access layer (ADMIN.E).
 * Collection configs should import helpers from here — avoid inline role checks.
 */
import type { Access, AccessArgs, FieldAccess, Where } from "payload";
import { PHOTO_PUBLISHED_WHERE, MAKER_PUBLISHED_WHERE } from "@/lib/cms-filters";
import {
  isContentEditorRole,
  isDeveloperRole,
  isOwnerRole,
  isPrivilegedRole,
  roleOf,
  type UserWithRole,
} from "./roles";

type Args = AccessArgs;
type User = UserWithRole | null | undefined;

export const isAuthenticated = ({ req: { user } }: Args): boolean => Boolean(user);

export const isOwner = ({ req: { user } }: Args): boolean =>
  isOwnerRole(roleOf(user as User));

export const isDeveloper = ({ req: { user } }: Args): boolean =>
  isDeveloperRole(roleOf(user as User));

export const isContentEditor = ({ req: { user } }: Args): boolean =>
  isContentEditorRole(roleOf(user as User));

export const isOwnerOrDeveloper = ({ req: { user } }: Args): boolean => {
  const role = roleOf(user as User);
  return isOwnerRole(role) || isDeveloperRole(role);
};

/** Any signed-in CMS operator (Owner / Editor / Developer). */
export const isStaff = ({ req: { user } }: Args): boolean =>
  roleOf(user as User) != null;

/** @deprecated Use isOwner — kept for older call sites during ADMIN.E. */
export const isAdmin = isOwner;

export const canManageContent = ({ req: { user } }: Args): boolean =>
  roleOf(user as User) != null;

export const canManageLeads = isOwnerOrDeveloper;

export const canManageUsers = isOwnerOrDeveloper;

export const canAccessSystemCollections = isDeveloper;

export const canHardDelete = isDeveloper;

/** /admin panel: all three roles. */
export const adminPanelAccess = ({ req: { user } }: Args): boolean =>
  roleOf(user as User) != null;

/** Owner+Developer only surfaces (leads list, etc.). */
export const ownerOrDeveloperPanelAccess = isOwnerOrDeveloper;

/** Developer-only admin visibility for system collections. */
export const developerPanelAccess = isDeveloper;

/** Legacy name: owner-facing CRUD previously meant admin-only. Prefer canManageContent. */
export const adminCrud: Access = ({ req: { user } }) =>
  isOwnerRole(roleOf(user as User)) || isDeveloperRole(roleOf(user as User));

export const contentCrud: Access = canManageContent;

export const adminFieldAccess: FieldAccess = ({ req: { user } }) =>
  isOwnerRole(roleOf(user as User)) || isDeveloperRole(roleOf(user as User));

export const developerFieldAccess: FieldAccess = ({ req: { user } }) =>
  isDeveloperRole(roleOf(user as User));

/** Published catalog read, or full staff read. */
export const publishedOrStaff = (statusField = "status"): Access =>
  ({ req: { user } }) => {
    if (isStaff({ req: { user } } as Args)) return true;
    return { [statusField]: { equals: "published" } };
  };

/** Makers: public must match frontend MAKER_PUBLISHED_WHERE (ADMIN-A-P2-13). */
export const makerReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as Args)) return true;
  return MAKER_PUBLISHED_WHERE;
};

export const staffOnlyRead: Access = ({ req: { user } }) =>
  isStaff({ req: { user } } as Args);

export const developerOnlyRead: Access = ({ req: { user } }) =>
  isDeveloperRole(roleOf(user as User));

export const reviewReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as Args)) return true;
  return { status: { equals: "published" } };
};

export const guideReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as Args)) return true;
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

/**
 * Articles: after ADMIN.E sync hook, custom `status` is canonical for lifecycle
 * (incl. hidden/archived). Public still requires Payload `_status=published`
 * so a bad draft version cannot leak; sync keeps them aligned when owner publishes.
 */
const ARTICLE_PUBLIC_WHERE: Where = {
  and: [
    { _status: { equals: "published" } },
    { status: { equals: "published" } },
  ],
};

export const articleReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as Args)) return true;
  return ARTICLE_PUBLIC_WHERE;
};

export const leadsReadAccess: Access = canManageLeads;
export const leadsUpdateAccess: Access = canManageLeads;
/** Hard delete: Developer only (Owner closes via CRM status). */
export const leadsDeleteAccess: Access = canHardDelete;
/** Create only via trusted Local API (`overrideAccess`) after spam checks. */
export const leadsCreateAccess: Access = canManageLeads;

export const mediaReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as Args)) return true;
  return { visibility: { equals: "public" } };
};
export const mediaWriteAccess: Access = canManageContent;
/** Prefer soft-removal; hard delete media is Developer (relational safety). */
export const mediaDeleteAccess: Access = canHardDelete;

export const photoReadAccess: Access = ({ req: { user } }) => {
  if (isStaff({ req: { user } } as Args)) return true;
  return PHOTO_PUBLISHED_WHERE;
};

/** Content delete: Owner/Editor blocked at access+hook for non-archived; Developer always. */
export const contentDeleteAccess: Access = ({ req: { user } }) => {
  const role = roleOf(user as User);
  if (isDeveloperRole(role)) return true;
  if (role == null) return false;
  // Narrowing for non-dev happens in beforeDelete (status must be archived).
  return true;
};

export const usersReadAccess: Access = canManageUsers;
export const usersCreateAccess: Access = canManageUsers;
export const usersUpdateAccess: Access = canManageUsers;
export const usersDeleteAccess: Access = canManageUsers;

export { isPrivilegedRole, roleOf };
export type { UserWithRole };
