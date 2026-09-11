/**
 * ADMIN.B unit checks: slugify + revalidate path matrix + publish guard messages.
 * Run: npx tsx scripts/test-admin-b-cms.ts
 */
import assert from "node:assert/strict";
import {
  isForbiddenPublicSlug,
  isValidSlug,
  nextSlugCandidate,
  slugifyTitle,
  transliterateCyrillic,
} from "../lib/slug";
import { pathsForRevalidate, tagsForRevalidate } from "../lib/revalidate-paths";

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

check("transliterate cyrillic", () => {
  assert.equal(transliterateCyrillic("Иркутск"), "irkutsk");
  assert.equal(slugifyTitle("Деревянный Иркутск"), "derevyannyy-irkutsk");
  assert.equal(slugifyTitle("Алёна"), "alena");
});

check("slugify strips junk", () => {
  assert.equal(slugifyTitle("  Hello!!! World  "), "hello-world");
  assert.equal(slugifyTitle("Café — test"), "cafe-test");
  assert.ok(isValidSlug(slugifyTitle("Алёна Ямщикова")));
});

check("forbidden placeholder slugs", () => {
  assert.equal(isForbiddenPublicSlug("Slug"), true);
  assert.equal(isForbiddenPublicSlug("slug"), true);
  assert.equal(isForbiddenPublicSlug("wooden-irkutsk"), false);
});

check("next slug candidate", () => {
  assert.equal(nextSlugCandidate("tour", 1), "tour");
  assert.equal(nextSlugCandidate("tour", 2), "tour-2");
});

check("excursion revalidate includes map + detail", () => {
  const paths = pathsForRevalidate({
    collection: "excursions",
    slug: "baikal-day",
  });
  assert.ok(paths.includes("/map"));
  assert.ok(paths.includes("/excursions/baikal-day"));
  assert.ok(paths.includes("/business"));
  assert.ok(paths.includes("/"));
  assert.ok(!paths.every((p) => p === "/business"));
});

check("routes revalidate", () => {
  const paths = pathsForRevalidate({ collection: "routes", slug: "center" });
  assert.ok(paths.includes("/map"));
  assert.ok(paths.includes("/map/center"));
});

check("reviews + guides revalidate", () => {
  assert.ok(pathsForRevalidate({ collection: "reviews" }).includes("/"));
  assert.ok(
    pathsForRevalidate({ collection: "guides" }).includes("/about/guides")
  );
});

check("tags for collection", () => {
  const tags = tagsForRevalidate({ collection: "articles", slug: "x" });
  assert.ok(tags.includes("cms:articles"));
  assert.ok(tags.includes("cms:articles:x"));
});

check("publish guard source present", async () => {
  const mod = await import("../payload/hooks/publish-guards");
  assert.equal(typeof mod.excursionPublishGuardBeforeValidate, "function");
  assert.equal(typeof mod.routePublishGuardBeforeValidate, "function");

  const draftOk = mod.excursionPublishGuardBeforeValidate({
    data: { status: "draft", title: "T" },
    req: {} as never,
    operation: "create",
  } as never);
  assert.ok(draftOk);

  assert.throws(
    () =>
      mod.excursionPublishGuardBeforeValidate({
        data: {
          status: "published",
          shortDescription: "ok",
          priceOnRequest: false,
          price: null,
          duration: 90,
        },
        req: {} as never,
        operation: "create",
      } as never),
    /цену/i
  );

  assert.throws(
    () =>
      mod.excursionPublishGuardBeforeValidate({
        data: {
          status: "published",
          shortDescription: "ok",
          priceOnRequest: true,
          duration: null,
        },
        req: {} as never,
        operation: "create",
      } as never),
    /длительн/i
  );

  const publishedOk = mod.excursionPublishGuardBeforeValidate({
    data: {
      status: "published",
      shortDescription: "ok",
      priceOnRequest: false,
      price: 1500,
      duration: 120,
    },
    req: {} as never,
    operation: "create",
  } as never);
  assert.ok(publishedOk);

  assert.throws(
    () =>
      mod.routePublishGuardBeforeValidate({
        data: {
          status: "published",
          description: "ok",
          routePoints: [],
        },
        req: {} as never,
        operation: "create",
      } as never),
    /точек/i
  );
});

console.log(`\nADMIN.B CMS checks: ${passed} passed`);
