-- ADMIN.E role enum extension (NOT applied to production in this gate).
-- Local/disposable: safe to run after review.
-- Production: only during an explicit rollout gate after remote recovery point exists.
--
-- Mapping (machine values unchanged for existing owners):
--   admin     = Owner
--   editor    = Content Editor
--   developer = Developer (NEW)

ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'developer';
