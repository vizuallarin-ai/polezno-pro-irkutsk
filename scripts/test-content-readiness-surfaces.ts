#!/usr/bin/env npx tsx
/**
 * Gate C.1 readiness surfaces — fixtures only, no CMS writes.
 * Run: npm run test:readiness
 */

import assert from "node:assert/strict";
import {
  catalogReadiness,
  classifyCommercialRecord,
  commercialInputFromDoc,
  isSectionPagePublic,
  mayRenderPublicDetail,
  publicSurfacesForRecord,
  type CommercialRecordInput,
} from "../lib/content-readiness";

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

const publishedReadyProduct: CommercialRecordInput = {
  kind: "product",
  status: "published",
  title: "Карта исторического центра",
  slug: "center-map-ready",
  altTexts: ["Печатная карта центра Иркутска"],
  mediaFilenames: ["center-map.jpg"],
  mediaUrls: ["/api/media/file/center-map.jpg"],
};

const draftProduct: CommercialRecordInput = {
  kind: "product",
  status: "draft",
  title: "Черновик сувенира",
  slug: "draft-souvenir",
};

const demoByTitle: CommercialRecordInput = {
  kind: "product",
  status: "published",
  title: "Демо-сувенир",
  slug: "postcard",
};

const demoByMediaAlt: CommercialRecordInput = {
  kind: "product",
  status: "published",
  title: "Мини-гид «Иркутск за 3 дня»",
  slug: "mini-guide-3-days",
  altTexts: ["Демо-сувенир Иркпортала"],
  mediaFilenames: ["seed-placeholder-souvenir.svg"],
  mediaUrls: ["/api/media/file/seed-placeholder-souvenir.svg"],
};

const incompleteProduct: CommercialRecordInput = {
  kind: "product",
  status: "published",
  title: "",
  slug: "missing-title",
};

const publishedReadyArticle: CommercialRecordInput = {
  kind: "article",
  status: "published",
  _status: "published",
  title: "Деревянный Иркутск",
  slug: "wooden-irkutsk",
};

const placeholderGuide: CommercialRecordInput = {
  kind: "guide",
  name: "Алёна",
  slug: "Slug",
  isActive: true,
};

test("1. Published-ready entity is available in listing", () => {
  assert.equal(publicSurfacesForRecord(publishedReadyProduct).listing, true);
});

test("2. Published-ready entity is available in detail", () => {
  assert.equal(publicSurfacesForRecord(publishedReadyProduct).detail, true);
});

test("3. Published-ready entity is in sitemap", () => {
  assert.equal(publicSurfacesForRecord(publishedReadyProduct).sitemap, true);
  assert.equal(publicSurfacesForRecord(publishedReadyProduct).indexable, true);
});

test("4. Draft entity is absent from all public surfaces", () => {
  const surfaces = publicSurfacesForRecord(draftProduct);
  assert.equal(surfaces.state, "incomplete");
  assert.equal(surfaces.listing, false);
  assert.equal(surfaces.detail, false);
  assert.equal(surfaces.sitemap, false);
  assert.equal(surfaces.indexable, false);
});

test("5. Demo entity (title or media) is absent from all public surfaces", () => {
  for (const demo of [demoByTitle, demoByMediaAlt]) {
    const surfaces = publicSurfacesForRecord(demo);
    assert.equal(surfaces.state, "demo");
    assert.equal(surfaces.listing, false);
    assert.equal(surfaces.detail, false);
    assert.equal(surfaces.sitemap, false);
    assert.equal(surfaces.indexable, false);
  }
});

test("6. Incomplete entity is absent from all public surfaces", () => {
  const surfaces = publicSurfacesForRecord(incompleteProduct);
  assert.equal(surfaces.state, "incomplete");
  assert.equal(surfaces.listing, false);
  assert.equal(surfaces.detail, false);
  assert.equal(surfaces.sitemap, false);
});

test("7. Empty collection keeps the section page with prelaunch state", () => {
  assert.equal(isSectionPagePublic(), true);
  assert.equal(catalogReadiness(0), "empty");
  assert.equal(catalogReadiness(2), "published-ready");
});

test("8. Direct demo detail URL does not bypass readiness", () => {
  assert.equal(mayRenderPublicDetail(demoByMediaAlt), false);
  assert.equal(mayRenderPublicDetail({ ...demoByMediaAlt, allowPreview: true }), false);
});

test("9. Placeholder guide is not production-ready", () => {
  assert.equal(classifyCommercialRecord(placeholderGuide), "incomplete");
  assert.equal(publicSurfacesForRecord(placeholderGuide).listing, false);
  assert.equal(publicSurfacesForRecord(placeholderGuide).detail, false);
});

test("Explore article stays published-ready", () => {
  const surfaces = publicSurfacesForRecord(publishedReadyArticle);
  assert.equal(surfaces.state, "published-ready");
  assert.equal(surfaces.listing, true);
  assert.equal(surfaces.detail, true);
  assert.equal(surfaces.sitemap, true);
});

test("Admin preview can show draft without making it public", () => {
  assert.equal(
    mayRenderPublicDetail({ ...draftProduct, allowPreview: true }),
    true
  );
  const publicSurfaces = publicSurfacesForRecord(draftProduct);
  assert.equal(publicSurfaces.listing, false);
  assert.equal(publicSurfaces.sitemap, false);
  assert.equal(publicSurfaces.indexable, false);
});

test("Sitemap input from CMS doc sees seed media alt", () => {
  const input = commercialInputFromDoc("product", {
    status: "published",
    title: "Постер «Деревянный Иркутск»",
    slug: "poster-wooden-irkutsk",
    gallery: [
      {
        image: {
          alt: "Демо-сувенир Иркпортала",
          filename: "seed-placeholder-souvenir.svg",
          url: "/api/media/file/seed-placeholder-souvenir.svg",
        },
      },
    ],
  });
  assert.equal(classifyCommercialRecord(input), "demo");
  assert.equal(publicSurfacesForRecord(input).sitemap, false);
});

test("Listing, detail and sitemap stay aligned for every fixture state", () => {
  const fixtures = [
    publishedReadyProduct,
    draftProduct,
    demoByTitle,
    demoByMediaAlt,
    incompleteProduct,
    publishedReadyArticle,
    placeholderGuide,
  ];
  for (const fixture of fixtures) {
    const surfaces = publicSurfacesForRecord(fixture);
    assert.equal(surfaces.listing, surfaces.detail);
    assert.equal(surfaces.listing, surfaces.sitemap);
    assert.equal(surfaces.indexable, surfaces.listing);
  }
});

console.log(`\nReadiness surface tests: ${passed} passed, ${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
