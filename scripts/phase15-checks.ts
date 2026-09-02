#!/usr/bin/env npx tsx
/**
 * Phase 15 local contract checks — no production mutations.
 * Run: npm run check:phase15
 */
import assert from "node:assert/strict";
import { compactLeadSchema } from "../lib/leads-schema";
import { buildTrackingFields, buildUnifiedLeadData } from "../lib/leads-api-helpers";
import { PUBLISHED_STATUS_WHERE, ARTICLE_PUBLISHED_WHERE } from "../lib/cms-filters";
import {
  buildReleaseIdentity,
  releaseIdentityMatchesExpected,
  RELEASE_PROJECT_ID,
} from "../lib/release-identity";
import {
  getRequiredSitemapStaticUrls,
  isValidSitemapXml,
  sitemapContainsDemoMarkers,
  sitemapContainsRequiredStaticUrls,
  buildSitemapCmsErrorLog,
} from "../lib/sitemap-contract";
import {
  demoFallbackContractOk,
  isDemoPublicMarker,
  isPublishedCommercialCandidate,
} from "../lib/public-content-contract";
import {
  assertDisposableDatabaseUrl,
  assertRuntimeDatabaseHandshake,
  isAllowedSshTunnelDatabaseUrl,
  isBlockedProductionDatabaseUrl,
  parseDatabaseUrl,
} from "../lib/build-database-guard";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}`);
    console.error(err instanceof Error ? err.message : err);
  }
}

test("release identity defaults to unknown SHA without build env", () => {
  const identity = buildReleaseIdentity({});
  assert.equal(identity.project, RELEASE_PROJECT_ID);
  assert.equal(identity.status, "ok");
  assert.equal(identity.commitSha, "unknown");
  assert.equal(identity.buildTimestamp, "unknown");
});

test("release identity reads GIT_COMMIT_SHA", () => {
  const identity = buildReleaseIdentity({
    GIT_COMMIT_SHA: "abc123",
    BUILD_TIMESTAMP: "2026-09-01T12:00:00.000Z",
  });
  assert.equal(identity.commitSha, "abc123");
  assert.equal(identity.buildTimestamp, "2026-09-01T12:00:00.000Z");
});

test("release SHA match fails on unknown live SHA", () => {
  assert.equal(
    releaseIdentityMatchesExpected({ commitSha: "unknown" }, "abc123"),
    false
  );
  assert.equal(
    releaseIdentityMatchesExpected({ commitSha: "abc123" }, "abc123"),
    true
  );
});

test("sitemap XML contract", () => {
  const sample = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://irkportal.ru/</loc></url></urlset>`;
  assert.equal(isValidSitemapXml(sample), true);
  assert.equal(isValidSitemapXml("<html></html>"), false);
});

test("sitemap required static URLs", () => {
  const base = "https://irkportal.ru";
  const body = getRequiredSitemapStaticUrls(base)
    .map((url) => `<loc>${url}</loc>`)
    .join("");
  assert.equal(sitemapContainsRequiredStaticUrls(body, base), true);
  assert.equal(sitemapContainsDemoMarkers(body).length, 0);
});

test("demo markers detected in sitemap body", () => {
  const body = "<loc>https://irkportal.ru/souvenirs/demo-product</loc>";
  assert.ok(sitemapContainsDemoMarkers(body).includes("demo-"));
});

test("sitemap CMS error log is sanitized", () => {
  const log = buildSitemapCmsErrorLog(
    new Error("connection refused postgresql://secret:pass@host/db")
  );
  assert.equal(log.phase, "sitemap_cms_urls");
  assert.equal(log.outcome, "error");
  assert.ok(!JSON.stringify(log).includes("postgresql://"));
});

test("published status filters require published", () => {
  assert.deepEqual(PUBLISHED_STATUS_WHERE, { status: { equals: "published" } });
  assert.ok(Array.isArray(ARTICLE_PUBLISHED_WHERE.and));
});

test("demo content excluded from commercial candidates", () => {
  assert.equal(
    isPublishedCommercialCandidate({
      status: "published",
      title: "Демо-сувенир",
      slug: "real-slug",
    }),
    false
  );
  assert.equal(
    isPublishedCommercialCandidate({
      status: "published",
      title: "Авто экскурсия",
      slug: "auto-tour",
    }),
    true
  );
  assert.equal(isDemoPublicMarker("seed-placeholder"), true);
});

test("demo fallback disabled on production with DATABASE_URL", () => {
  assert.equal(
    demoFallbackContractOk({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://localhost/test",
    }),
    true
  );
  assert.equal(
    demoFallbackContractOk({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://localhost/test",
      ALLOW_DEMO_FALLBACK: "true",
    }),
    false
  );
});

test("lead payload validation preserves route context", () => {
  const body = {
    name: "Тест",
    contact: "test@example.com",
    message: "Хочу экскурсию",
    sourceType: "route",
    sourceSlug: "center-walk",
    sourceTitle: "Центр за два часа",
    routeSlug: "center-walk",
    requestType: "excursion",
    consentAccepted: true,
  };
  const parsed = compactLeadSchema.parse(body);
  assert.equal(parsed.sourceType, "route");
  assert.equal(parsed.routeSlug, "center-walk");
  const tracking = buildTrackingFields(body, "https://irkportal.ru/map/center-walk");
  assert.equal(tracking.routeSlug, "center-walk");
  const unified = buildUnifiedLeadData(parsed, "route", "https://irkportal.ru/map/center-walk");
  assert.equal(unified.sourceType, "route");
  assert.equal(unified.routeSlug, "center-walk");
});

test("disposable database guard blocks production-like URLs", () => {
  assert.throws(() =>
    assertDisposableDatabaseUrl("postgresql://polezno_irkutsk@90.156.170.182:5432/polezno_irkutsk")
  );
  assert.equal(
    isBlockedProductionDatabaseUrl("postgresql://build:pass@ep-disposable.neon.tech/neondb"),
    false
  );
  assert.throws(() => assertDisposableDatabaseUrl(""));
});

test("SSH tunnel disposable URL contract", () => {
  const tunnel =
    "postgresql://phase15_builder_a1b2c3d4@127.0.0.1:55432/irkportal_phase15_pre_a1b2c3d4";
  assert.equal(isAllowedSshTunnelDatabaseUrl(tunnel), true);
  assert.doesNotThrow(() => assertDisposableDatabaseUrl(tunnel));
  const parsed = parseDatabaseUrl(tunnel);
  assert.equal(parsed.host, "127.0.0.1");
  assert.equal(parsed.port, "55432");
  assert.equal(parsed.username, "phase15_builder_a1b2c3d4");
  assert.equal(parsed.database, "irkportal_phase15_pre_a1b2c3d4");
  assert.throws(() =>
    assertDisposableDatabaseUrl(
      "postgresql://phase15_builder_x@127.0.0.1:5432/irkportal_phase15_pre_x"
    )
  );
  assert.throws(() =>
    assertDisposableDatabaseUrl(
      "postgresql://phase15_builder_x@127.0.0.1:55432/polezno_irkutsk"
    )
  );
  assert.throws(() =>
    assertDisposableDatabaseUrl(
      "postgresql://postgres@127.0.0.1:55432/irkportal_phase15_pre_x"
    )
  );
});

test("runtime database handshake rejects mismatched database", () => {
  const url =
    "postgresql://phase15_builder_a1b2c3d4@127.0.0.1:55432/irkportal_phase15_pre_a1b2c3d4";
  assert.throws(() =>
    assertRuntimeDatabaseHandshake(url, {
      currentDatabase: "wrong_db",
      currentUser: "phase15_builder_a1b2c3d4",
      isSuperuser: false,
    })
  );
  assert.throws(() =>
    assertRuntimeDatabaseHandshake(url, {
      currentDatabase: "irkportal_phase15_pre_a1b2c3d4",
      currentUser: "wrong_user",
      isSuperuser: false,
    })
  );
  assert.throws(() =>
    assertRuntimeDatabaseHandshake(url, {
      currentDatabase: "irkportal_phase15_pre_a1b2c3d4",
      currentUser: "phase15_builder_a1b2c3d4",
      isSuperuser: true,
    })
  );
  assert.doesNotThrow(() =>
    assertRuntimeDatabaseHandshake(url, {
      currentDatabase: "irkportal_phase15_pre_a1b2c3d4",
      currentUser: "phase15_builder_a1b2c3d4",
      isSuperuser: false,
    })
  );
});

console.log(`\nPhase 15 checks: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
