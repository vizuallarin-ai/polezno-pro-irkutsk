import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";

type UserWithRole = { role?: "admin" | "editor" | null; id?: string | number };

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

  if (!user || user.role !== "admin") {
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
