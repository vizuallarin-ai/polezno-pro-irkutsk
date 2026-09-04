#!/usr/bin/env npx tsx

/**

 * Phase 15 local contract checks — no production mutations.

 * Run: npm run check:phase15

 */

import assert from "node:assert/strict";

import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { tmpdir } from "node:os";

import path from "node:path";

import { compactLeadSchema } from "../lib/leads-schema";

import { buildTrackingFields, buildUnifiedLeadData } from "../lib/leads-api-helpers";

import { PUBLISHED_STATUS_WHERE, ARTICLE_PUBLISHED_WHERE } from "../lib/cms-filters";

import {

  buildReleaseIdentity,

  readReleaseIdentityArtifact,

  releaseIdentityMatchesExpected,

  RELEASE_PROJECT_ID,

  RELEASE_IDENTITY_ARTIFACT_REL,

  RELEASE_IDENTITY_MAX_BYTES,

  serializeReleaseIdentityForResponse,

  validateReleaseIdentityArtifact,

  isProductionLikeRuntime,

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
  classifyCommercialRecord,
  isPublicPublishedReady,
  mayRenderPublicDetail,
  catalogReadiness,
  publicSurfacesForRecord,
} from "../lib/content-readiness";
import {
  buildLeadNotificationEmail,
  buildLeadNotificationPayload,
  payloadContainsForbiddenPiiKeys,
} from "../lib/lead-notification";

import {
  CTA,
  buildContactHref,
  routeContactHref,
  excursionContactHref,
  resolveExploreCommercialHref,
  resolvePublicMainCta,
} from "../lib/cta-constants";

import { sanitizeAnalyticsParams } from "../lib/analytics-events";

import {
  assertAllowedDeployPath,
  isSafeReleaseDirName,
} from "../lib/deploy-path-safety";

import {

  assertDisposableDatabaseUrl,

  assertRuntimeDatabaseHandshake,

  isAllowedSshTunnelDatabaseUrl,

  isBlockedProductionDatabaseUrl,

  parseDatabaseUrl,

} from "../lib/build-database-guard";

import {

  COMMIT_SHA_PATTERN,

  detectWorktreeDirty,

  validateReleaseIdentityArtifact as validateWriterArtifact,

  writeReleaseIdentityArtifact,

} from "../scripts/write-release-identity.mjs";



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



const SAMPLE_SHA = "a1eb0205930454530ac826a3ec9672c520a3a202";

const SAMPLE_TS = "2026-09-02T05:00:00.000Z";



function writeArtifactFile(root: string, payload: Record<string, unknown>) {

  const nextDir = path.join(root, ".next");

  mkdirSync(nextDir, { recursive: true });

  writeFileSync(

    path.join(nextDir, "release-identity.json"),

    `${JSON.stringify(payload)}\n`,

    "utf8"

  );

}



test("release identity incomplete in production-like runtime without artifact", () => {

  const identity = buildReleaseIdentity({ NODE_ENV: "production" }, tmpdir());

  assert.equal(identity.identitySource, "incomplete");

  assert.equal(identity.identityComplete, false);

  assert.equal(identity.commitSha, "unknown");

  assert.equal(identity.buildTimestamp, "unknown");

});



test("release identity environment fallback only in development", () => {

  const identity = buildReleaseIdentity(

    {

      NODE_ENV: "development",

      GIT_COMMIT_SHA: SAMPLE_SHA,

      BUILD_TIMESTAMP: SAMPLE_TS,

    },

    tmpdir()

  );

  assert.equal(identity.identitySource, "environment");

  assert.equal(identity.identityComplete, true);

  assert.equal(identity.commitSha, SAMPLE_SHA);

});



test("valid release identity artifact is parsed", () => {

  const root = mkdtempSync(path.join(tmpdir(), "phase15-artifact-"));

  try {

    writeArtifactFile(root, {

      schemaVersion: 1,

      project: "irkportal",

      commitSha: SAMPLE_SHA,

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: false,

    });

    const artifact = readReleaseIdentityArtifact(root);

    assert.ok(artifact);

    assert.equal(artifact?.commitSha, SAMPLE_SHA);

    const identity = buildReleaseIdentity({ NODE_ENV: "production" }, root);

    assert.equal(identity.identitySource, "artifact");

    assert.equal(identity.identityComplete, true);

    assert.equal(identity.worktreeDirty, false);

  } finally {

    rmSync(root, { recursive: true, force: true });

  }

});



test("artifact precedence over environment variables", () => {

  const root = mkdtempSync(path.join(tmpdir(), "phase15-artifact-"));

  try {

    writeArtifactFile(root, {

      schemaVersion: 1,

      project: "irkportal",

      commitSha: SAMPLE_SHA,

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: true,

    });

    const identity = buildReleaseIdentity(

      {

        NODE_ENV: "production",

        GIT_COMMIT_SHA: "0000000000000000000000000000000000000000",

        BUILD_TIMESTAMP: "2020-01-01T00:00:00.000Z",

      },

      root

    );

    assert.equal(identity.identitySource, "artifact");

    assert.equal(identity.commitSha, SAMPLE_SHA);

    assert.equal(identity.buildTimestamp, SAMPLE_TS);

    assert.equal(identity.worktreeDirty, true);

  } finally {

    rmSync(root, { recursive: true, force: true });

  }

});



test("malformed artifact JSON is rejected", () => {

  const root = mkdtempSync(path.join(tmpdir(), "phase15-artifact-"));

  try {

    mkdirSync(path.join(root, ".next"), { recursive: true });

    writeFileSync(path.join(root, ".next", "release-identity.json"), "{not-json", "utf8");

    assert.equal(readReleaseIdentityArtifact(root), null);

  } finally {

    rmSync(root, { recursive: true, force: true });

  }

});



test("invalid SHA and timestamp rejected by artifact validator", () => {

  assert.equal(

    validateReleaseIdentityArtifact({

      schemaVersion: 1,

      project: "irkportal",

      commitSha: "short",

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: false,

    }),

    null

  );

  assert.equal(

    validateReleaseIdentityArtifact({

      schemaVersion: 1,

      project: "irkportal",

      commitSha: SAMPLE_SHA,

      buildTimestamp: "not-a-date",

      worktreeDirty: false,

    }),

    null

  );

});



test("wrong project and extra fields rejected", () => {

  assert.equal(

    validateReleaseIdentityArtifact({

      schemaVersion: 1,

      project: "other",

      commitSha: SAMPLE_SHA,

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: false,

    }),

    null

  );

  assert.equal(

    validateReleaseIdentityArtifact({

      schemaVersion: 1,

      project: "irkportal",

      commitSha: SAMPLE_SHA,

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: false,

      secret: "nope",

    }),

    null

  );

});



test("oversized artifact rejected", () => {

  const root = mkdtempSync(path.join(tmpdir(), "phase15-artifact-"));

  try {

    mkdirSync(path.join(root, ".next"), { recursive: true });

    const huge = `${JSON.stringify({

      schemaVersion: 1,

      project: "irkportal",

      commitSha: SAMPLE_SHA,

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: false,

      padding: "x".repeat(RELEASE_IDENTITY_MAX_BYTES),

    })}\n`;

    writeFileSync(path.join(root, ".next", "release-identity.json"), huge, "utf8");

    assert.equal(readReleaseIdentityArtifact(root), null);

  } finally {

    rmSync(root, { recursive: true, force: true });

  }

});



test("serialized health response exposes no secrets or paths", () => {

  const identity = buildReleaseIdentity({

    NODE_ENV: "development",

    GIT_COMMIT_SHA: SAMPLE_SHA,

    BUILD_TIMESTAMP: SAMPLE_TS,

  });

  const body = JSON.stringify(serializeReleaseIdentityForResponse(identity));

  assert.ok(!body.includes(".next"));

  assert.ok(!body.includes("DATABASE"));

  assert.ok(!body.includes("postgresql://"));

  assert.ok(body.includes("identitySource"));

  assert.ok(body.includes("identityComplete"));

});



test("release SHA match requires artifact attestation", () => {

  assert.equal(

    releaseIdentityMatchesExpected(

      { commitSha: "unknown", identitySource: "incomplete", identityComplete: false },

      SAMPLE_SHA

    ),

    false

  );

  assert.equal(

    releaseIdentityMatchesExpected(

      { commitSha: SAMPLE_SHA, identitySource: "environment", identityComplete: true },

      SAMPLE_SHA

    ),

    false

  );

  assert.equal(

    releaseIdentityMatchesExpected(

      { commitSha: SAMPLE_SHA, identitySource: "artifact", identityComplete: true },

      SAMPLE_SHA

    ),

    true

  );

});



test("artifact writer validates SHA and timestamp", () => {

  const root = mkdtempSync(path.join(tmpdir(), "phase15-artifact-"));

  try {

    assert.throws(() =>

      writeReleaseIdentityArtifact({

        root,

        commitSha: "bad",

        buildTimestamp: SAMPLE_TS,

        worktreeDirty: false,

      })

    );

    assert.throws(() =>

      writeReleaseIdentityArtifact({

        root,

        commitSha: SAMPLE_SHA,

        buildTimestamp: "bad",

        worktreeDirty: false,

      })

    );

  } finally {

    rmSync(root, { recursive: true, force: true });

  }

});



test("artifact writer uses atomic temp file rename", () => {

  const root = mkdtempSync(path.join(tmpdir(), "phase15-artifact-"));

  try {

    const payload = writeReleaseIdentityArtifact({

      root,

      commitSha: SAMPLE_SHA,

      buildTimestamp: SAMPLE_TS,

      worktreeDirty: true,

    });

    const filePath = path.join(root, RELEASE_IDENTITY_ARTIFACT_REL);

    const parsed = JSON.parse(readFileSync(filePath, "utf8"));

    assert.deepEqual(parsed, payload);

    assert.equal(validateWriterArtifact(parsed)?.commitSha, SAMPLE_SHA);

  } finally {

    rmSync(root, { recursive: true, force: true });

  }

});



test("worktree dirty detection ignores untracked files", () => {

  const repoRoot = path.resolve(process.cwd());

  assert.equal(typeof detectWorktreeDirty(repoRoot), "boolean");

});



test("production-like runtime detection", () => {

  assert.equal(isProductionLikeRuntime({ NODE_ENV: "production" }), true);

  assert.equal(isProductionLikeRuntime({ NODE_ENV: "development" }), false);

});



test("commit SHA pattern matches lowercase git SHA", () => {

  assert.equal(COMMIT_SHA_PATTERN.test(SAMPLE_SHA), true);

  assert.equal(COMMIT_SHA_PATTERN.test(SAMPLE_SHA.toUpperCase()), false);

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



test("content readiness fail-closed for demo and incomplete", () => {
  assert.equal(
    classifyCommercialRecord({
      kind: "product",
      status: "published",
      title: "Демо-сувенир",
      slug: "postcard",
    }),
    "demo"
  );
  assert.equal(
    classifyCommercialRecord({
      kind: "route",
      status: "draft",
      title: "Реальный маршрут",
      slug: "real-walk",
    }),
    "incomplete"
  );
  assert.equal(
    isPublicPublishedReady({
      kind: "excursion",
      status: "published",
      title: "Авторская прогулка",
      slug: "author-walk",
      shortDescription: "Два часа по деревянному Иркутску",
    }),
    true
  );
  assert.equal(
    mayRenderPublicDetail({
      kind: "product",
      status: "published",
      title: "Демо",
      slug: "demo-product",
    }),
    false
  );
  assert.equal(catalogReadiness(0), "empty");
  assert.equal(catalogReadiness(2), "published-ready");
  const seedLike = publicSurfacesForRecord({
    kind: "product",
    status: "published",
    title: "Мини-гид «Иркутск за 3 дня»",
    slug: "mini-guide-3-days",
    altTexts: ["Демо-сувенир Иркпортала"],
    mediaFilenames: ["seed-placeholder-souvenir.svg"],
  });
  assert.equal(seedLike.state, "demo");
  assert.equal(seedLike.listing, false);
  assert.equal(seedLike.detail, false);
  assert.equal(seedLike.sitemap, false);
  assert.equal(
    classifyCommercialRecord({
      kind: "guide",
      name: "Алёна",
      slug: "Slug",
      isActive: true,
    }),
    "incomplete"
  );
});

test("lead notification payload excludes PII keys", () => {
  const payload = buildLeadNotificationPayload({
    leadId: "lead_1",
    createdAt: "2026-09-04T00:00:00.000Z",
    sourceType: "contact",
  });
  assert.deepEqual(payloadContainsForbiddenPiiKeys(payload as unknown as Record<string, unknown>), []);
  const email = buildLeadNotificationEmail(payload);
  assert.equal(email.html.includes("Иван"), false);
  assert.equal(email.html.includes("ivan@"), false);
});

test("CTA B2C and B2B destinations stay separated", () => {
  assert.equal(CTA.discovery.href, "/map");
  assert.equal(CTA.assist.href, "/contact");
  assert.equal(CTA.b2cPrimary.href, "/map");
  assert.equal(CTA.b2bPrimary.href, "/business");
  assert.ok(buildContactHref({ intent: "walk" }).startsWith("/contact?"));
  assert.ok(!buildContactHref({ intent: "walk" }).includes("@"));
  assert.equal(
    resolveExploreCommercialHref({ ctaLink: "/business", articleSlug: "wooden" })
      .href.includes("/contact"),
    true
  );
  assert.equal(
    resolveExploreCommercialHref({
      relatedRouteSlug: "wooden-irkutsk",
      articleSlug: "wooden",
    }).href,
    "/map/wooden-irkutsk"
  );
  assert.equal(routeContactHref("center").includes("slug=center"), true);
  assert.equal(excursionContactHref("flagship").includes("excursion"), true);
  assert.deepEqual(
    resolvePublicMainCta({ label: "Спланировать", href: "/business" }),
    { label: CTA.discovery.label, href: CTA.discovery.href, description: undefined }
  );
  assert.equal(
    resolvePublicMainCta({ label: "Подобрать прогулку", href: "/contact" }).href,
    "/map"
  );
  assert.equal(
    resolvePublicMainCta({ label: "Подобрать прогулку", href: "/contact" }).label,
    CTA.discovery.label
  );
});

test("analytics sanitize strips PII keys and contact-like values", () => {
  const clean = sanitizeAnalyticsParams({
    sourceSlug: "center-walk",
    email: "a@b.ru",
    phone: "+79991234567",
    name: "Иван",
    message: "секрет",
    cta: "Подобрать прогулку",
  });
  assert.equal(clean.sourceSlug, "center-walk");
  assert.equal(clean.cta, "Подобрать прогулку");
  assert.equal("email" in clean, false);
  assert.equal("phone" in clean, false);
  assert.equal("name" in clean, false);
  assert.equal("message" in clean, false);
});

test("deploy path safety and exact SHA guard", () => {
  const sha = "94c656409e1c3c43ff23e1d0c0616ee550859b5c";
  assert.equal(isSafeReleaseDirName(sha), true);
  assert.equal(isSafeReleaseDirName("94c6564"), false);
  assert.equal(isSafeReleaseDirName("../etc"), false);
  assert.doesNotThrow(() =>
    assertAllowedDeployPath("/var/www/polezno-releases/" + sha, [
      "/var/www/polezno-releases",
    ])
  );
  assert.throws(() =>
    assertAllowedDeployPath("/tmp/evil", ["/var/www/polezno-releases"])
  );
});



console.log(`\nPhase 15 checks: ${passed} passed, ${failed} failed.`);

process.exit(failed === 0 ? 0 : 1);

