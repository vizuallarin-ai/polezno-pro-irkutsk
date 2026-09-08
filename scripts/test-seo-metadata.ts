#!/usr/bin/env npx tsx
/**
 * SEO.1 contract tests — no DB mutation, no network required.
 * Run: npm run test:seo
 */
import assert from "node:assert/strict";
import {
  absoluteCanonical,
  canonicalAlternate,
  normalizeCanonicalPath,
} from "../lib/seo/canonical";
import { absoluteTitle, pageTitle, stripBrandSuffix } from "../lib/seo/title";
import { robotsForContentPresence } from "../lib/seo/robots-policy";
import {
  articleSchema,
  breadcrumbSchema,
  eventSchema,
  organizationSchema,
  productSchema,
  serializeJsonLd,
  touristTripSchema,
  websiteSchema,
} from "../lib/jsonld";
import { buildPageMetadata, getMetaDescription, getMetaTitle } from "../lib/seo-metadata";
import { isValidSitemapXml, getRequiredSitemapStaticUrls } from "../lib/sitemap-contract";
import { DEFAULT_SITE_URL } from "../lib/site-url";

function section(name: string) {
  console.log(`\n✓ ${name}`);
}

section("title system — no double brand / no undefined");
assert.equal(stripBrandSuffix("Маршруты | Иркпортал"), "Маршруты");
assert.equal(stripBrandSuffix("Маршруты — Иркпортал"), "Маршруты");
assert.equal(pageTitle(null, "История города"), "История города");
assert.equal(pageTitle(" SEO Title ", "Fallback"), "SEO Title");
assert.equal(absoluteTitle("Иркпортал — гид").absolute, "Иркпортал — гид");
assert.equal(getMetaTitle({ title: "Экскурсия" }, "Экскурсия"), "Экскурсия");
assert.ok(!String(getMetaTitle({ title: "A" }, "A")).includes("undefined"));

section("description fallback contract");
assert.equal(
  getMetaDescription({ seo: { description: "From SEO" }, excerpt: "Excerpt" }),
  "From SEO"
);
assert.equal(
  getMetaDescription({ excerpt: "From excerpt" }),
  "From excerpt"
);
assert.equal(
  getMetaDescription({ shortDescription: "Short" }),
  "Short"
);
assert.equal(
  getMetaDescription({}, { metaDescription: "Site default" }),
  "Site default"
);
assert.equal(getMetaDescription({}), "");

section("canonical helpers");
assert.equal(normalizeCanonicalPath("map/"), "/map");
assert.equal(normalizeCanonicalPath("/map/"), "/map");
assert.equal(normalizeCanonicalPath("/"), "/");
assert.equal(canonicalAlternate("/contact").canonical, "/contact");
assert.equal(
  absoluteCanonical("/explore/foo", "https://irkportal.ru"),
  "https://irkportal.ru/explore/foo"
);
assert.equal(DEFAULT_SITE_URL, "https://irkportal.ru");

section("robots policy");
assert.deepEqual(robotsForContentPresence(true), { index: true, follow: true });
assert.deepEqual(robotsForContentPresence(false), {
  index: false,
  follow: true,
});

section("buildPageMetadata — home-like section + article");
const homeish = buildPageMetadata(
  { title: "Explore", excerpt: "Desc" },
  "Explore",
  undefined,
  { path: "/explore" }
);
assert.equal(homeish.title, "Explore");
assert.equal(homeish.description, "Desc");
assert.deepEqual(homeish.alternates, { canonical: "/explore" });
assert.ok(homeish.openGraph);
assert.ok(homeish.twitter);

const missingPath = buildPageMetadata({ title: "X", excerpt: "Y" }, "X");
assert.equal(missingPath.alternates, undefined);

section("structured data — fact-safe shapes");
const org = organizationSchema({ name: "Иркпортал" });
assert.equal(org["@type"], "Organization");
assert.equal("address" in org, false);
assert.equal("contactPoint" in org, false);

const web = websiteSchema();
assert.equal(web["@type"], "WebSite");
assert.equal("potentialAction" in web, false);

const article = articleSchema({
  title: "История",
  description: "Текст",
  url: "https://irkportal.ru/explore/history-demo",
  publishedAt: "2026-01-01",
  authorName: "Алёна Ямщикова",
});
assert.equal(article["@type"], "Article");
assert.equal((article.author as { name: string }).name, "Алёна Ямщикова");

const noAuthor = articleSchema({
  title: "X",
  description: "Y",
  url: "https://irkportal.ru/explore/x",
});
assert.equal("author" in noAuthor, false);

const event = eventSchema({
  title: "Фестиваль",
  description: "Описание",
  url: "https://irkportal.ru/events/fest",
  startDate: "2026-06-01",
  location: "Иркутск",
  offers: { price: "по запросу" },
});
assert.equal("offers" in event, false);

const priced = eventSchema({
  title: "Фестиваль",
  description: "Описание",
  url: "https://irkportal.ru/events/fest",
  startDate: "2026-06-01",
  location: "Иркутск",
  offers: { price: "500" },
});
assert.ok(priced.offers);

const product = productSchema({
  title: "Значок",
  description: "Описание",
  url: "https://irkportal.ru/souvenirs/pin",
  price: 0,
});
assert.equal("offers" in product, false);

const trip = touristTripSchema({
  title: "Прогулка",
  description: "Описание",
  url: "https://irkportal.ru/map/walk",
  price: 0,
});
assert.equal("offers" in trip, false);
assert.equal((trip.provider as { "@type": string })["@type"], "Organization");

const crumbs = breadcrumbSchema([
  { label: "Главная", href: "/" },
  { label: "Explore", href: "/explore" },
]);
assert.equal(crumbs["@type"], "BreadcrumbList");

section("JSON-LD XSS serialization");
const evil = serializeJsonLd({ name: "</script><script>alert(1)" });
assert.ok(evil.includes("\\u003c"));
assert.ok(!evil.includes("</script>"));
JSON.parse(evil.replace(/\\u003c/g, "<"));

section("sitemap contract helpers");
assert.equal(
  isValidSitemapXml('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'),
  true
);
const required = getRequiredSitemapStaticUrls("https://irkportal.ru");
assert.ok(required.includes("https://irkportal.ru"));
assert.ok(required.includes("https://irkportal.ru/map"));
assert.ok(required.includes("https://irkportal.ru/explore"));
assert.ok(!required.includes("https://irkportal.ru/events"));

console.log("\nAll SEO.1 contract tests passed.\n");
