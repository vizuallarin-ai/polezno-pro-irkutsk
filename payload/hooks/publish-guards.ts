import type { CollectionBeforeValidateHook } from "payload";
import {
  evaluateExcursionPublish,
  evaluateRoutePublish,
} from "@/lib/admin/publish-checklist";
import { isGuidePlaceholderProfile } from "@/lib/content-readiness";

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object") return data as Record<string, unknown>;
  return null;
}

/**
 * Commercial publish guard for excursions.
 * Drafts may be incomplete; published offers must have honest pricing + duration.
 * Rules: `lib/admin/publish-checklist.ts` (shared with ADMIN.C UI).
 */
export const excursionPublishGuardBeforeValidate: CollectionBeforeValidateHook =
  ({ data }) => {
    const doc = asRecord(data);
    if (!doc) return data;
    if (doc.status !== "published") return data;

    const result = evaluateExcursionPublish(doc);
    if (result.blockingMessages[0]) {
      throw new Error(result.blockingMessages[0]);
    }

    return data;
  };

/**
 * Minimal publish guard for routes: description + at least one map point.
 * Paid routes must have a price.
 */
export const routePublishGuardBeforeValidate: CollectionBeforeValidateHook = ({
  data,
}) => {
  const doc = asRecord(data);
  if (!doc) return data;
  if (doc.status !== "published") return data;

  const result = evaluateRoutePublish(doc);
  if (result.blockingMessages[0]) {
    throw new Error(result.blockingMessages[0]);
  }

  return data;
};

/**
 * Guides: incomplete / placeholder profiles cannot be marked active for public.
 */
export const guidePublicSafetyBeforeValidate: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const doc = asRecord(data);
  if (!doc) return data;

  const slug =
    typeof doc.slug === "string"
      ? doc.slug
      : typeof (originalDoc as { slug?: string } | undefined)?.slug === "string"
        ? String((originalDoc as { slug: string }).slug)
        : "";

  const name =
    typeof doc.name === "string"
      ? doc.name
      : typeof (originalDoc as { name?: string } | undefined)?.name === "string"
        ? String((originalDoc as { name: string }).name)
        : "";

  const isPlaceholder = isGuidePlaceholderProfile({ name, slug });

  if (isPlaceholder) {
    if (doc.isActive === true) {
      throw new Error(
        "Нельзя показать на сайте незаполненный профиль гида (placeholder). Заполните имя и ссылку, либо оставьте профиль выключенным."
      );
    }
    doc.isActive = false;
  }

  return data;
};
