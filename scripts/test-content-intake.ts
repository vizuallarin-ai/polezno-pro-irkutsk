#!/usr/bin/env npx tsx
/**
 * CONTENT.0 unit tests — fixtures only, no CMS / DB.
 * Run: npm run test:content-intake
 */

import assert from "node:assert/strict";
import {
  TEST_FIXTURE_PACK,
  TEST_FIXTURE_INCOMPLETE,
  EMPTY_OWNER_PACK,
  normalizeOwnerPack,
  normalizePriceStructure,
  validateOwnerPack,
  buildIngestPlan,
  diffOwnerPacks,
  detectDuplicateFilenames,
} from "../lib/content-intake";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`ok  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok  ${name}`);
    console.error(error);
  }
}

test("empty pack is NOT_RECEIVED and not ready", () => {
  const r = validateOwnerPack(EMPTY_OWNER_PACK);
  assert.equal(r.received, false);
  assert.equal(r.readyForIngest, false);
  assert.equal(r.readyForPublish, false);
  assert.equal(r.minimumLaunch.result, "OWNER_CONTENT_STILL_BLOCKED");
  assert.equal(r.packStatus, "NOT_RECEIVED");
});

test("valid TEST_FIXTURE pack validates without inventing publish", () => {
  const r = validateOwnerPack(TEST_FIXTURE_PACK);
  assert.equal(r.isTestFixture, true);
  assert.equal(r.readyForPublish, false);
  assert.ok(r.received);
  // test fixtures never flip production readyForIngest
  assert.equal(r.readyForIngest, false);
  assert.equal(r.minimumLaunch.result, "MINIMUM_LAUNCH_PACK_READY");
});

test("missing required fields → incomplete / blockers", () => {
  const r = validateOwnerPack(TEST_FIXTURE_INCOMPLETE);
  assert.ok(r.blockers.length > 0);
  assert.ok(r.blockers.some((b) => b.code === "PRICE_AMBIGUOUS"));
  assert.ok(r.blockers.some((b) => b.code === "NEEDS_GEOCODING"));
  assert.ok(r.blockers.some((b) => b.code === "SOURCE_UNVERIFIED"));
  assert.ok(r.blockers.some((b) => b.code === "RIGHTS_BLOCKED"));
  assert.ok(r.blockers.some((b) => b.code === "DUPLICATE_MEDIA_FILENAME"));
});

test("ambiguous price is not auto-resolved to fixed amount unit", () => {
  const n = normalizePriceStructure({
    rawOwnerText: "от 15 тысяч",
    pricingUnit: "unknown",
  });
  assert.equal(n.ambiguous, true);
  assert.ok(n.pricingUnit === "from" || n.pricingUnit === "ambiguous" || n.pricingUnit === "unknown");
});

test("missing media rights blocks publish path", () => {
  const r = validateOwnerPack(TEST_FIXTURE_INCOMPLETE);
  const media = r.entities.find((e) => e.ownerContentId === "media.test-no-rights");
  assert.ok(media);
  assert.equal(media!.readyForIngest, false);
  assert.ok(media!.issues.some((i) => i.code === "RIGHTS_BLOCKED"));
});

test("duplicate entity / media detection", () => {
  const dups = detectDuplicateFilenames(TEST_FIXTURE_INCOMPLETE.media);
  assert.ok(dups.includes("dup.jpg"));
});

test("invalid coordinates blocked", () => {
  const pack = normalizeOwnerPack({
    ...TEST_FIXTURE_PACK,
    routes: [
      {
        ownerContentId: "route.bad-coords",
        title: "Bad",
        shortDescription: "desc",
        category: "history",
        points: [{ title: "X", lat: 999, lng: 104 }],
      },
    ],
  });
  const r = validateOwnerPack(pack);
  assert.ok(r.blockers.some((b) => b.code === "INVALID_COORDINATES"));
});

test("unknown review source blocked", () => {
  const r = validateOwnerPack(TEST_FIXTURE_INCOMPLETE);
  assert.ok(r.blockers.some((b) => b.code === "SOURCE_UNVERIFIED"));
});

test("normalization trims and slugifies without inventing facts", () => {
  const n = normalizeOwnerPack({
    ...EMPTY_OWNER_PACK,
    packVersion: "v1",
    status: "RECEIVED",
    excursions: [
      {
        ownerContentId: "excursion.x",
        title: "  Hello  ",
        slug: "Hello World!!",
        shortDescription: "a\r\nb\n\n\nc",
      },
    ],
  });
  assert.equal(n.excursions[0].title, "Hello");
  assert.equal(n.excursions[0].slug, "hello-world");
  assert.ok(!n.excursions[0].price);
  assert.ok(!(n.excursions[0] as { meetingPoint?: string }).meetingPoint);
});

test("idempotent plan uses UPDATE_CANDIDATE on mapping/slug hit", () => {
  const plan = buildIngestPlan(TEST_FIXTURE_PACK, {
    existingSlugs: { excursions: ["test-fixture-excursion"] },
  });
  const item = plan.items.find(
    (i) => i.ownerContentId === "excursion.test-fixture-01"
  );
  assert.ok(item);
  assert.equal(item!.action, "UPDATE_CANDIDATE");
  assert.equal(plan.productionWrite, false);
});

test("empty pack plan skips and never writes", () => {
  const plan = buildIngestPlan(EMPTY_OWNER_PACK);
  assert.equal(plan.readyForIngest, false);
  assert.equal(plan.productionWrite, false);
  assert.ok(plan.items.some((i) => i.action === "WOULD_SKIP"));
});

test("pack diff detects price change", () => {
  const next = normalizeOwnerPack({
    ...TEST_FIXTURE_PACK,
    excursions: [
      {
        ...TEST_FIXTURE_PACK.excursions[0],
        price: {
          ...TEST_FIXTURE_PACK.excursions[0].price!,
          amount: 2000,
        },
      },
    ],
  });
  const changes = diffOwnerPacks(TEST_FIXTURE_PACK, next);
  assert.ok(changes.some((c) => c.path.includes("price") && c.kind === "CHANGED"));
});

test("--execute path blocked in plan builder", () => {
  const plan = buildIngestPlan(EMPTY_OWNER_PACK, { allowExecute: true });
  assert.ok(plan.items.some((i) => i.reason.includes("forbids execute")));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
