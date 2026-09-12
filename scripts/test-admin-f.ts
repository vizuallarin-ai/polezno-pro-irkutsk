/**
 * ADMIN.F — release-readiness unit checks (no production mutations).
 * Run: npm run test:admin-f
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  buildOwnerLaunchReadiness,
  contactsFilled,
} from "../lib/admin/owner-launch-readiness";
import { LEAD_STATUS_VALUES } from "../lib/leads/crm";
import { BACKUP_POLICY } from "../lib/runtime-lifecycle.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;

async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    throw err;
  }
}

async function main() {
  await check("migration SQL artifact exists and is additive", () => {
    const p = path.join(root, "scripts/migrations/admin-f-prod-to-target.sql");
    assert.equal(fs.existsSync(p), true);
    const sql = fs.readFileSync(p, "utf8");
    assert.match(sql, /ADD VALUE IF NOT EXISTS 'developer'/);
    assert.match(sql, /ADD VALUE IF NOT EXISTS 'booked'/);
    assert.match(sql, /ADD VALUE IF NOT EXISTS 'declined'/);
    assert.match(sql, /ADD COLUMN IF NOT EXISTS "next_contact_at"/);
    assert.match(sql, /enum_reviews_status/);
    assert.doesNotMatch(sql, /\bDROP TABLE\b/i);
    assert.doesNotMatch(sql, /\bDROP COLUMN\b/i);
  });

  await check("legacy lead statuses remain in CRM model", () => {
    const legacy = ["new", "in_progress", "replied", "closed", "spam"] as const;
    for (const s of legacy) {
      assert.equal((LEAD_STATUS_VALUES as readonly string[]).includes(s), true, s);
    }
    assert.equal((LEAD_STATUS_VALUES as readonly string[]).includes("booked"), true);
    assert.equal((LEAD_STATUS_VALUES as readonly string[]).includes("declined"), true);
  });

  await check("owner launch readiness does not false-GO on empty content", () => {
    const readiness = buildOwnerLaunchReadiness({
      leadsNew: 0,
      leadsOverdue: 0,
      leadsDueToday: 0,
      leadsUnscheduled: 0,
      recentNewLeads: [],
      excursions: { published: 0, drafts: 0, publishedReady: 0 },
      routes: { published: 0, drafts: 0, publishedReady: 0 },
      articles: { published: 0, drafts: 0, publishedReady: 0 },
      reviews: { published: 0, drafts: 0, publishedReady: 0 },
      photos: { total: 0, publishedReady: 0, pendingModeration: 0 },
      guides: { total: 1, publicReady: 0, hasPlaceholder: true, placeholderId: 1 },
      contacts: { hasPhone: false, hasEmail: false, hasTelegram: true },
      recentDrafts: [],
    });
    assert.equal(readiness.allCriticalOk, false);
    assert.equal(readiness.okCount < readiness.totalCount, true);
  });

  await check("contactsFilled requires at least one channel", () => {
    assert.equal(
      contactsFilled({ hasPhone: false, hasEmail: false, hasTelegram: false }),
      false
    );
    assert.equal(
      contactsFilled({ hasPhone: false, hasEmail: false, hasTelegram: true }),
      true
    );
  });

  await check("backup health reports NOT LIVE without OFFSITE_MODE", () => {
    const r = spawnSync(
      process.execPath,
      [path.join(root, "scripts/backup-health-check.mjs")],
      {
        cwd: root,
        env: {
          ...process.env,
          OFFSITE_MODE: "",
          REQUIRE_MEDIA_BACKUP: "0",
          BACKUP_DIR: path.join(root, ".tmp-admin-f-health-empty"),
        },
        encoding: "utf8",
      }
    );
    const dir = path.join(root, ".tmp-admin-f-health");
    fs.mkdirSync(dir, { recursive: true });
    const dump = path.join(dir, "polezno_adminf_probe.dump");
    fs.writeFileSync(dump, "probe");
    const r2 = spawnSync(
      process.execPath,
      [path.join(root, "scripts/backup-health-check.mjs")],
      {
        cwd: root,
        env: {
          ...process.env,
          OFFSITE_MODE: "",
          REQUIRE_MEDIA_BACKUP: "0",
          BACKUP_DIR: dir,
        },
        encoding: "utf8",
      }
    );
    assert.equal(r2.status, 2, r2.stdout);
    const body = JSON.parse(r2.stdout);
    assert.equal(body.offsite.status, "NOT_LIVE");
    assert.equal(body.offsite.db.status, "NOT_LIVE");
    assert.equal(body.offsite.media.status, "NOT_LIVE");
    assert.ok(body.gate === "ADMIN.F" || body.gate === "ADMIN.E");
    assert.ok(r.status === 1 || r.status === 2);
    assert.ok(BACKUP_POLICY.criticalAgeHours > 0);
  });

  await check("rollout / rollback runbook docs exist", () => {
    for (const rel of [
      "docs/ops/PRODUCTION_ROLLOUT_RUNBOOK.md",
      "docs/ops/PRODUCTION_ROLLBACK_RUNBOOK.md",
    ]) {
      const p = path.join(root, rel);
      assert.equal(fs.existsSync(p), true, rel);
      const text = fs.readFileSync(p, "utf8");
      assert.match(text, /TARGET_RELEASE_SHA|Rollback|STOP/i);
    }
  });

  console.log(`ADMIN.F checks passed: ${passed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
