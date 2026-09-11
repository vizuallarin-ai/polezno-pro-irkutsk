import type { CollectionBeforeChangeHook } from "payload";

/**
 * Articles dual-status resolution (ADMIN.E / ADMIN-A-P1-11).
 *
 * Canonical owner lifecycle = custom `status`
 * (draft | published | hidden | archived) — supports archive-first.
 *
 * Payload drafts `_status` is kept in sync:
 * - status === published → _status = published
 * - otherwise → _status = draft
 *
 * Public read still requires both published (defense in depth).
 * Owner UI: set «Статус публикации»; Payload Publish aligns via this hook.
 */
export const articleStatusSyncBeforeChange: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  if (!data) return data;

  const nextStatus =
    (typeof data.status === "string" && data.status) ||
    (typeof originalDoc?.status === "string" && originalDoc.status) ||
    "draft";

  if (nextStatus === "published") {
    data._status = "published";
  } else {
    data._status = "draft";
  }

  return data;
};
