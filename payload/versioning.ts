/**
 * Shared Payload versions config (ADMIN.E).
 *
 * Commercial collections already use custom `status` (draft/published/hidden/archived).
 * Enable versions WITHOUT drafts to avoid a second `_status` publish control.
 * Articles keep drafts (already live) + sync hook for dual-status.
 *
 * Retention rationale (small project, rich text + media refs):
 * - ~weekly edits per flagship doc → 25 versions ≈ months of history
 * - finite to bound Postgres growth; Payload enforces maxPerDoc / max
 */
export const CONTENT_VERSIONS = {
  maxPerDoc: 25,
} as const;

/** Articles: keep drafts+autosave; bound retention. */
export const ARTICLE_VERSIONS = {
  maxPerDoc: 40,
  drafts: {
    autosave: true,
  },
} as const;

export const GLOBAL_VERSIONS = {
  max: 25,
} as const;
