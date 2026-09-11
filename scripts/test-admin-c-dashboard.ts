/**
 * ADMIN.C unit checks: owner readiness, attention, publish checklist, routes.
 * Run: npm run test:admin-c
 */
import assert from "node:assert/strict";
import {
  buildAttentionItems,
  buildOwnerLaunchReadiness,
  classifyGuideDocs,
  contactsFilled,
  countPublishedReadyDocs,
  isFalseReadyGuard,
  type OwnerDashboardSnapshotInput,
} from "../lib/admin/owner-launch-readiness";
import {
  evaluateExcursionPublish,
  evaluateRoutePublish,
} from "../lib/admin/publish-checklist";
import {
  adminCollectionPath,
  adminCreatePath,
  adminEditPath,
  adminGlobalPath,
  buildOwnerQuickActions,
} from "../lib/admin/admin-routes";
import { isGuidePlaceholderProfile } from "../lib/content-readiness";
import {
  excursionPublishGuardBeforeValidate,
  routePublishGuardBeforeValidate,
} from "../payload/hooks/publish-guards";

let passed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    throw err;
  }
}

const emptySnapshot = (): OwnerDashboardSnapshotInput => ({
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
  guides: { total: 0, publicReady: 0, hasPlaceholder: false },
  contacts: { hasPhone: false, hasEmail: false, hasTelegram: false },
  recentDrafts: [],
});

check("contacts require at least one channel", () => {
  assert.equal(
    contactsFilled({ hasPhone: false, hasEmail: false, hasTelegram: false }),
    false
  );
  assert.equal(
    contactsFilled({ hasPhone: true, hasEmail: false, hasTelegram: false }),
    true
  );
});

check("empty project is not launch-ready", () => {
  const readiness = buildOwnerLaunchReadiness(emptySnapshot());
  assert.equal(readiness.allCriticalOk, false);
  assert.equal(readiness.okCount, 0);
  assert.ok(readiness.criteria.every((c) => c.state !== "ok"));
});

check("missing excursion and route produce attention", () => {
  const snap = emptySnapshot();
  snap.contacts = { hasPhone: true, hasEmail: false, hasTelegram: false };
  const readiness = buildOwnerLaunchReadiness(snap);
  const attention = buildAttentionItems(snap, readiness);
  assert.ok(attention.some((a) => a.id === "readiness-excursion"));
  assert.ok(attention.some((a) => a.id === "readiness-route"));
  assert.ok(
    attention.find((a) => a.id === "readiness-excursion")?.title.includes(
      "экскурсии"
    )
  );
});

check("new leads create high attention", () => {
  const snap = emptySnapshot();
  snap.leadsNew = 2;
  snap.contacts = { hasPhone: true, hasEmail: true, hasTelegram: true };
  snap.excursions.publishedReady = 1;
  snap.routes.publishedReady = 1;
  snap.guides.publicReady = 1;
  snap.reviews.publishedReady = 1;
  snap.photos.publishedReady = 4;
  const readiness = buildOwnerLaunchReadiness(snap);
  const attention = buildAttentionItems(snap, readiness);
  assert.ok(attention.some((a) => a.id === "leads-new"));
  assert.equal(attention[0]?.id, "leads-new");
});

check("overdue leads outrank new leads in attention", () => {
  const snap = emptySnapshot();
  snap.leadsNew = 1;
  snap.leadsOverdue = 2;
  snap.contacts = { hasPhone: true, hasEmail: true, hasTelegram: true };
  snap.excursions.publishedReady = 1;
  snap.routes.publishedReady = 1;
  snap.guides.publicReady = 1;
  snap.reviews.publishedReady = 1;
  snap.photos.publishedReady = 4;
  const readiness = buildOwnerLaunchReadiness(snap);
  const attention = buildAttentionItems(snap, readiness);
  assert.equal(attention[0]?.id, "leads-overdue");
  assert.ok(attention.some((a) => a.id === "leads-new"));
});

check("placeholder guide warning", () => {
  assert.equal(
    isGuidePlaceholderProfile({ name: "Имя гида", slug: "Slug" }),
    true
  );
  const guides = classifyGuideDocs([
    { id: 9, name: "Имя гида", slug: "Slug", isActive: false },
  ]);
  assert.equal(guides.hasPlaceholder, true);
  assert.equal(guides.placeholderId, 9);
  assert.equal(guides.publicReady, 0);

  const snap = emptySnapshot();
  snap.guides = {
    total: 1,
    publicReady: 0,
    hasPlaceholder: true,
    placeholderId: 9,
  };
  const readiness = buildOwnerLaunchReadiness(snap);
  const guide = readiness.criteria.find((c) => c.id === "guide");
  assert.equal(guide?.state, "fail");
  assert.ok(guide?.detail.toLowerCase().includes("заглушка") || guide?.detail.includes("не готов"));
  const attention = buildAttentionItems(snap, readiness);
  assert.ok(
    attention.some(
      (a) => a.id === "readiness-guide" && a.title.includes("не готов")
    )
  );
});

check("demo products do not imply ready", () => {
  assert.equal(
    isFalseReadyGuard({
      productsPublished: 5,
      arPublished: 2,
      excursionsPublishedReady: 0,
      routesPublishedReady: 0,
    }),
    true
  );
  const snap = emptySnapshot();
  snap.excursions = { published: 0, drafts: 0, publishedReady: 0 };
  const readiness = buildOwnerLaunchReadiness(snap);
  assert.equal(readiness.allCriticalOk, false);
});

check("published-ready count uses content-readiness", () => {
  const n = countPublishedReadyDocs("excursion", [
    {
      title: "Флагман",
      slug: "flagship",
      status: "published",
      shortDescription: "Прогулка",
    },
    {
      title: "Демо-экскурсия",
      slug: "demo-excursion",
      status: "published",
      shortDescription: "x",
    },
  ]);
  assert.equal(n, 1);
});

check("excursion publish checklist matches guard", () => {
  const incomplete = evaluateExcursionPublish({
    title: "T",
    shortDescription: "",
    priceOnRequest: false,
    price: null,
    duration: null,
  });
  assert.equal(incomplete.ready, false);
  assert.ok(incomplete.items.some((i) => i.id === "price" && !i.ok));
  assert.ok(incomplete.blockingMessages.length >= 1);

  assert.throws(
    () =>
      excursionPublishGuardBeforeValidate({
        data: {
          status: "published",
          shortDescription: "ok",
          priceOnRequest: false,
          price: null,
          duration: 60,
        },
        req: {} as never,
        operation: "create",
      } as never),
    /цену/i
  );

  const ready = evaluateExcursionPublish({
    title: "Город",
    shortDescription: "Пешая прогулка",
    priceOnRequest: true,
    duration: 120,
  });
  assert.equal(ready.ready, true);
});

check("route publish checklist matches guard", () => {
  const incomplete = evaluateRoutePublish({
    title: "R",
    description: "",
    routePoints: [],
    type: "free",
  });
  assert.equal(incomplete.ready, false);

  assert.throws(
    () =>
      routePublishGuardBeforeValidate({
        data: {
          status: "published",
          description: "ok",
          routePoints: [],
          type: "free",
        },
        req: {} as never,
        operation: "create",
      } as never),
    /точек/i
  );

  const ready = evaluateRoutePublish({
    title: "Центр",
    description: "Короткий маршрут",
    type: "free",
    routePoints: [{ lat: 52.28, lng: 104.28, published: true }],
  });
  assert.equal(ready.ready, true);
});

check("quick action routes are admin paths", () => {
  const actions = buildOwnerQuickActions("https://example.test");
  assert.ok(actions.some((a) => a.href === adminCreatePath("excursions")));
  assert.ok(actions.some((a) => a.href === adminCollectionPath("leads")));
  assert.ok(actions.some((a) => a.href === adminGlobalPath("site-settings")));
  const site = actions.find((a) => a.id === "open-site");
  assert.equal(site?.href, "https://example.test");
  assert.equal(site?.external, true);
  assert.equal(adminEditPath("guides", 9), "/admin/collections/guides/9");
});

check("full ready snapshot has empty attention except optional", () => {
  const snap = emptySnapshot();
  snap.contacts = { hasPhone: true, hasEmail: true, hasTelegram: true };
  snap.excursions = { published: 1, drafts: 0, publishedReady: 1 };
  snap.routes = { published: 1, drafts: 0, publishedReady: 1 };
  snap.guides = { total: 1, publicReady: 1, hasPlaceholder: false };
  snap.reviews = { published: 2, drafts: 0, publishedReady: 2 };
  snap.photos = { total: 5, publishedReady: 4, pendingModeration: 0 };
  const readiness = buildOwnerLaunchReadiness(snap);
  assert.equal(readiness.allCriticalOk, true);
  assert.equal(readiness.okCount, 6);
  const attention = buildAttentionItems(snap, readiness);
  assert.equal(attention.length, 0);
});

console.log(`\nadmin-c: ${passed} passed`);
