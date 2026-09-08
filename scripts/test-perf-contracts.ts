#!/usr/bin/env npx tsx
/**
 * PERF.1 deterministic regression contracts — no network, no Lighthouse flakiness.
 * Run: npm run test:perf
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

function section(name: string) {
  console.log(`\n✓ ${name}`);
}

section("no site-wide opacity:0 page template");
assert.equal(
  existsSync(path.join(root, "app/(site)/template.tsx")),
  false,
  "app/(site)/template.tsx must stay deleted (hid content until JS)"
);

section("Metrika deferred (lazyOnload) and webvisor off on boot");
const metrika = read("components/analytics/yandex-metrika.tsx");
assert.match(metrika, /strategy=["']lazyOnload["']/);
assert.match(metrika, /webvisor:\s*false/);
assert.doesNotMatch(metrika, /webvisor:\s*true/);

section("Golos subsets exclude unused latin-ext");
const layout = read("app/(site)/layout.tsx");
assert.match(layout, /Golos_Text\(/);
assert.doesNotMatch(layout, /latin-ext/);
assert.match(layout, /Prata\(/);

section("featured photos query is bounded");
const photos = read("lib/photos.ts");
assert.match(photos, /getFeaturedPhotos\s*=\s*cache/);
assert.match(photos, /options\?:\s*\{\s*limit\?:\s*number/);
assert.match(photos, /getPublishedPhotos\(undefined,\s*\{\s*limit\s*\}/);

section("request memoization for settings/nav");
assert.match(read("lib/site-settings.ts"), /export const getSiteSettings = cache\(/);
assert.match(read("lib/navigation.ts"), /export const getNavigation = cache\(/);

section("below-fold photo grids default to no priority");
const grid = read("components/visual/editorial-photo-grid.tsx");
assert.match(grid, /priorityCount\s*=\s*0/);
assert.match(read("components/sections/photos-preview.tsx"), /priorityCount=\{0\}/);

section("empty map catalog does not mount RouteMap");
const mapClient = read("components/routes/routes-page-client.tsx");
assert.match(mapClient, /Карта появится вместе с опубликованными маршрутами/);
assert.doesNotMatch(
  mapClient,
  /isCatalogEmpty[\s\S]*?<RouteMap[\s\S]*?mapRoutes=\{\[\]\}/
);

section("Yandex Maps script loads async");
const mapsLoader = read("lib/yandex-maps-loader.ts");
assert.match(mapsLoader, /script\.async\s*=\s*true/);
assert.match(mapsLoader, /cache:\s*["']force-cache["']/);

section("Lenis cleans up gsap ticker");
const lenis = read("components/layout/lenis-provider.tsx");
assert.match(lenis, /gsap\.ticker\.remove/);
assert.match(lenis, /requestIdleCallback/);

section("brand OG asset stays reasonable");
const og = path.join(root, "public/og-default.jpg");
assert.ok(existsSync(og));
const ogKb = statSync(og).size / 1024;
assert.ok(ogKb < 200, `og-default.jpg is ${ogKb.toFixed(1)} KB (budget < 200 KB)`);

section("GSAP scroll reveals do not blank on hydrate");
for (const file of [
  "components/sections/scenario-picker.tsx",
  "components/sections/social-proof.tsx",
  "components/sections/final-cta.tsx",
]) {
  assert.match(read(file), /immediateRender:\s*false/);
}

console.log("\nAll PERF.1 contract tests passed.\n");
