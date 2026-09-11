import type {
  CollectionBeforeDeleteHook,
  CollectionBeforeChangeHook,
  Payload,
} from "payload";
import {
  isDeveloperRole,
  isOwnerRole,
  isPrivilegedRole,
  roleOf,
  type CmsRole,
  type UserWithRole,
} from "../roles";

const ARCHIVE_SAFE_STATUS = new Set(["archived", "hidden", "draft"]);

function actorRole(req: { user?: unknown }): CmsRole | null {
  return roleOf(req.user as UserWithRole | null);
}

/**
 * Hard delete of editorial content: Developer always;
 * Owner/Editor only after archive/hide/draft (not while published).
 */
export function createContentDeleteGuard(opts?: {
  statusField?: string;
  /** Guides use isActive instead of status. */
  mode?: "status" | "guide";
}): CollectionBeforeDeleteHook {
  const statusField = opts?.statusField ?? "status";
  const mode = opts?.mode ?? "status";

  return async ({ req, id, collection }) => {
    // Local API ops scripts may set context.bypassDeleteGuards with overrideAccess.
    if (req.context?.bypassDeleteGuards === true) return;

    const role = actorRole(req);
    if (isDeveloperRole(role)) return;

    if (role == null) {
      throw new Error("Недостаточно прав для удаления.");
    }

    const slug = collection?.slug;
    if (!slug) {
      throw new Error("Не удалось определить коллекцию для проверки удаления.");
    }

    const doc = await req.payload.findByID({
      collection: slug,
      id,
      depth: 0,
      overrideAccess: true,
    });

    if (mode === "guide") {
      if (doc?.isActive === true) {
        throw new Error(
          "Сначала снимите «Активен» у профиля гида, затем удаляйте. Либо попросите разработчика."
        );
      }
      return;
    }

    const status = String(doc?.[statusField] ?? "");
    if (status === "published") {
      throw new Error(
        "Нельзя удалить опубликованный материал. Сначала переведите в «В архиве» или «Скрыт»."
      );
    }
    if (!ARCHIVE_SAFE_STATUS.has(status)) {
      throw new Error(
        "Удаление разрешено только для черновиков, скрытых или архивных записей. Иначе обратитесь к разработчику."
      );
    }
  };
}

/** Leads: Owner must close via CRM; only Developer hard-deletes. */
export const leadsBeforeDeleteGuard: CollectionBeforeDeleteHook = async ({
  req,
}) => {
  if (req.context?.bypassDeleteGuards === true) return;
  const role = actorRole(req);
  if (isDeveloperRole(role)) return;
  throw new Error(
    "Заявки не удаляются. Переведите в «Завершено», «Отказ» или «Спам». Удаление — только у разработчика."
  );
};

/** Media hard delete: Developer only (owner uses replace/unpublish on parent docs). */
export const mediaBeforeDeleteGuard: CollectionBeforeDeleteHook = async ({
  req,
}) => {
  if (req.context?.bypassDeleteGuards === true) return;
  const role = actorRole(req);
  if (isDeveloperRole(role)) return;
  throw new Error(
    "Файлы медиа нельзя удалять из панели владельца/редактора — обратитесь к разработчику, чтобы не сломать ссылки на сайте."
  );
};

/**
 * Users lockout / escalation guards.
 * - no self-delete
 * - cannot delete last privileged (owner|developer) user
 * - Owner cannot assign/escalate to developer
 * - Owner cannot demote/delete developers
 * - cannot strip own privileged role if last privileged
 */
export const usersBeforeChangeGuard: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (req.context?.bypassDeleteGuards === true) return data;

  const actor = req.user as UserWithRole | null;
  const actorRole = roleOf(actor);
  if (!actorRole) {
    throw new Error("Недостаточно прав.");
  }

  const nextRole = (data?.role ?? originalDoc?.role) as CmsRole | undefined;
  const targetId = originalDoc?.id;

  if (isOwnerRole(actorRole) && nextRole === "developer") {
    throw new Error(
      "Владелец не может назначить роль «Разработчик». Это делает только разработчик."
    );
  }

  if (
    isOwnerRole(actorRole) &&
    operation === "update" &&
    originalDoc &&
    isDeveloperRole(roleOf(originalDoc as UserWithRole))
  ) {
    throw new Error("Владелец не может изменять учётную запись разработчика.");
  }

  if (
    operation === "update" &&
    targetId != null &&
    actor?.id != null &&
    String(targetId) === String(actor.id) &&
    data?.role != null &&
    data.role !== actorRole
  ) {
    if (isPrivilegedRole(actorRole) && !isPrivilegedRole(data.role as CmsRole)) {
      const privilegedLeft = await countPrivilegedUsers(req.payload, String(actor.id));
      if (privilegedLeft < 1) {
        throw new Error(
          "Нельзя снять с себя роль владельца/разработчика — вы последний привилегированный пользователь."
        );
      }
    }
  }

  return data;
};

export const usersBeforeDeleteGuard: CollectionBeforeDeleteHook = async ({
  req,
  id,
}) => {
  if (req.context?.bypassDeleteGuards === true) return;

  const actor = req.user as UserWithRole | null;
  const actorRole = roleOf(actor);
  if (!actorRole) {
    throw new Error("Недостаточно прав для удаления пользователей.");
  }

  if (actor?.id != null && String(actor.id) === String(id)) {
    throw new Error("Нельзя удалить свою собственную учётную запись.");
  }

  const target = await req.payload.findByID({
    collection: "users",
    id,
    depth: 0,
    overrideAccess: true,
  });

  const targetRole = roleOf(target as UserWithRole);

  if (isOwnerRole(actorRole) && isDeveloperRole(targetRole)) {
    throw new Error("Владелец не может удалить разработчика.");
  }

  if (isPrivilegedRole(targetRole)) {
    const remaining = await countPrivilegedUsers(req.payload, String(id));
    if (remaining < 1) {
      throw new Error(
        "Нельзя удалить последнего владельца или разработчика — система останется без админ-доступа."
      );
    }
  }
};

async function countPrivilegedUsers(
  payload: Payload,
  excludeId: string
): Promise<number> {
  const result = await payload.find({
    collection: "users",
    where: {
      and: [
        {
          or: [
            { role: { equals: "admin" } },
            { role: { equals: "developer" } },
          ],
        },
        { id: { not_equals: excludeId } },
      ],
    },
    limit: 5,
    depth: 0,
    overrideAccess: true,
  });
  return result.totalDocs;
}
