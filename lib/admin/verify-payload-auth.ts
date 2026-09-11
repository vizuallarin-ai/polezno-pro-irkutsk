import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { roleOf, type UserWithRole } from "@/payload/roles";

/**
 * Admin App Router surfaces that mutate operational data.
 * Owner + Developer (not Content Editor).
 */
export async function requireAdminUser(): Promise<{
  user: UserWithRole;
  unauthorizedResponse: null;
} | {
  user: null;
  unauthorizedResponse: Response;
}> {
  const payload = await getPayloadClient();
  const headerStore = await headers();
  const auth = await payload.auth({ headers: headerStore });
  const user = auth.user as UserWithRole | null;
  const role = roleOf(user);

  if (!user || (role !== "admin" && role !== "developer")) {
    return {
      user: null,
      unauthorizedResponse: Response.json(
        { ok: false, error: "Недостаточно прав администратора." },
        { status: 401 }
      ),
    };
  }

  return { user, unauthorizedResponse: null };
}
