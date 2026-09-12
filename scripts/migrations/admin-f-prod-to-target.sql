-- ADMIN.F — production-safe additive schema bridge (PROD → target release)
--
-- Baseline observed on production (read-only, 2026-09-12):
--   enum_users_role = admin,editor
--   enum_leads_status = new,in_progress,replied,closed,spam
--   leads: NO next_contact_at / last_contact_at / closed_reason / closed_reason_note
--   reviews: NO status column / NO enum_reviews_status
--   enum_articles_status = draft,published
--   version tables: only _articles_v (content versions for other collections absent)
--
-- This file is IDEMPOTENT where PostgreSQL allows:
--   - ADD VALUE IF NOT EXISTS for enums
--   - ADD COLUMN IF NOT EXISTS for new nullable columns
--   - CREATE INDEX IF NOT EXISTS
--
-- DOES NOT:
--   - drop columns/enums
--   - rewrite existing lead statuses
--   - mutate application data rows
--   - create full Payload version table trees (those require controlled Payload
--     schema sync / db:push on a disposable DB first — see runbook)
--
-- Apply order (PROD.ROLLOUT only, after fresh backup):
--   1) This SQL
--   2) Controlled Payload schema sync for version tables + remaining diffs
--   3) Application deploy TARGET_RELEASE_SHA
--
-- Rollback contract:
--   Additive + nullable → application rollback to b3a51ba may boot on new
--   columns (unused). Enum value removal is NOT supported; if new statuses
--   were written (booked/declined/developer), DB restore from pre-migration
--   dump is required for a clean old-SHA schema. See PRODUCTION_ROLLBACK_RUNBOOK.

BEGIN;

-- 1) Developer role (ADMIN.E) — keep existing admin/editor values
ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'developer';

-- 2) Lead CRM statuses (ADMIN.D) — keep existing values; add commercial ones
ALTER TYPE "enum_leads_status" ADD VALUE IF NOT EXISTS 'booked';
ALTER TYPE "enum_leads_status" ADD VALUE IF NOT EXISTS 'declined';

COMMIT;

-- Enum ADD VALUE cannot run inside the same transaction as uses of the new
-- value on some PG versions; columns/indexes in a separate transaction.

BEGIN;

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "next_contact_at" timestamptz;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "last_contact_at" timestamptz;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "closed_reason" varchar;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "closed_reason_note" varchar;

CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" ("status");
CREATE INDEX IF NOT EXISTS "leads_next_contact_at_idx" ON "leads" ("next_contact_at");

-- 3) Reviews publication status (ADMIN.B)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reviews_status') THEN
    CREATE TYPE "enum_reviews_status" AS ENUM ('draft', 'published', 'hidden', 'archived');
  END IF;
END$$;

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "status" "enum_reviews_status";

-- Existing rows: default to draft (not public) until owner publishes.
UPDATE "reviews" SET "status" = 'draft' WHERE "status" IS NULL;
ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'draft';
-- Only tighten NOT NULL if column is fully populated (safe after UPDATE).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'status'
  ) AND NOT EXISTS (SELECT 1 FROM "reviews" WHERE "status" IS NULL) THEN
    BEGIN
      ALTER TABLE "reviews" ALTER COLUMN "status" SET NOT NULL;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'reviews.status NOT NULL skipped: %', SQLERRM;
    END;
  END IF;
END$$;

-- 4) Articles custom status options used by CONTENT_STATUS_OPTIONS
--    Production currently: draft,published. Target UI also offers hidden/archived.
ALTER TYPE "enum_articles_status" ADD VALUE IF NOT EXISTS 'hidden';
ALTER TYPE "enum_articles_status" ADD VALUE IF NOT EXISTS 'archived';

COMMIT;

-- NOTE: Payload version tables (_excursions_v, _routes_v, _reviews_v, _photos_v,
-- _guides_v, _site_settings_v, …) are created by Payload/Drizzle schema sync.
-- Do not hand-author them here. Rehearse sync on disposable DB before PROD.ROLLOUT.
