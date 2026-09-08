#!/usr/bin/env node
/**
 * SEO smoke against a running origin (local or production).
 * Does not mutate DB.
 *
 * Usage:
 *   node scripts/seo-smoke.mjs
 *   SEO_SMOKE_BASE=http://127.0.0.1:3000 node scripts/seo-smoke.mjs
 *   SEO_SMOKE_BASE=https://irkportal.ru node scripts/seo-smoke.mjs
 */
import assert from "node:assert/strict";

const BASE = (process.env.SEO_SMOKE_BASE || "https://irkportal.ru").replace(
  /\/$/,
  ""
);
const EXPECT_HOST = "https://irkportal.ru";
const isLocal = /localhost|127\.0\.0\.1/.test(BASE);

/** @type {{ path: string, expectStatus?: number, expectIndex?: boolean, requireCanonical?: string, requireTitle?: RegExp }} */
const checks = [
  { path: "/", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/` },
  { path: "/explore", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/explore` },
  { path: "/map", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/map` },
  { path: "/business", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/business` },
  { path: "/about", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/about` },
  { path: "/contact", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/contact` },
  { path: "/privacy", expectStatus: 200, expectIndex: true, requireCanonical: `${EXPECT_HOST}/privacy` },
  { path: "/souvenirs/success", expectStatus: 200, expectIndex: false },
  { path: "/excursions/nonexistent-seo1-probe", expectStatus: 404 },
  { path: "/map/nonexistent-seo1-probe", expectStatus: 404 },
  { path: "/explore/nonexistent-seo1-probe", expectStatus: 404 },
  { path: "/this-path-should-404-seo1", expectStatus: 404 },
];

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

async function fetchText(url, { redirect = "manual" } = {}) {
  const res = await fetch(url, {
    redirect,
    headers: { "user-agent": "IrkPortal-SEO-Smoke/1.0" },
  });
  const text = await res.text();
  return { res, text };
}

async function checkPage(spec) {
  const url = `${BASE}${spec.path}`;
  const { res, text } = await fetchText(url, { redirect: "follow" });
  const status = res.status;
  const title = pick(text, /<title[^>]*>([^<]*)<\/title>/i);
  const description = pick(
    text,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  ) || pick(
    text,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
  );
  const canonical = pick(
    text,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  ) || pick(
    text,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
  );
  const robots =
    pick(text, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
    pick(text, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i);
  const h1 = pick(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]+>/g, "").trim();

  if (spec.expectStatus != null) {
    assert.equal(
      status,
      spec.expectStatus,
      `${spec.path} expected HTTP ${spec.expectStatus}, got ${status}`
    );
  }

  if (spec.expectIndex === true) {
    assert.ok(
      !robots || !/noindex/i.test(robots),
      `${spec.path} should be indexable, robots=${robots}`
    );
  }
  if (spec.expectIndex === false) {
    assert.ok(
      robots && /noindex/i.test(robots),
      `${spec.path} should be noindex, robots=${robots}`
    );
  }

  if (spec.requireCanonical) {
    assert.ok(canonical, `${spec.path} missing canonical`);
    if (!isLocal) {
      const norm = (u) => u.replace(/\/$/, "") || EXPECT_HOST;
      assert.equal(
        norm(canonical),
        norm(spec.requireCanonical),
        `${spec.path} canonical mismatch: ${canonical}`
      );
    }
  }

  if (spec.requireTitle) {
    assert.ok(title && spec.requireTitle.test(title), `${spec.path} title=${title}`);
  }

  if (status === 404) {
    assert.ok(
      !robots || /noindex/i.test(robots) || /Страница не найдена/i.test(title || ""),
      `${spec.path} 404 should not look indexable (robots=${robots}, title=${title})`
    );
  }

  return { path: spec.path, status, title, description, canonical, robots, h1 };
}

async function checkRobots() {
  const { res, text } = await fetchText(`${BASE}/robots.txt`);
  assert.equal(res.status, 200);
  assert.match(text, /Sitemap:\s*https?:\/\/[^\s]+\/sitemap\.xml/i);
  assert.match(text, /Host:\s*\S+/i);
  assert.match(text, /Disallow:\s*\/admin/i);
  assert.match(text, /Disallow:\s*\/api\//i);
  assert.match(text, /Disallow:\s*\/souvenirs\/success/i);
  if (!isLocal) {
    assert.match(text, /Host:\s*irkportal\.ru/i);
    assert.match(text, /Sitemap:\s*https:\/\/irkportal\.ru\/sitemap\.xml/i);
  }
  return text;
}

async function checkSitemap() {
  const { res, text } = await fetchText(`${BASE}/sitemap.xml`);
  assert.equal(res.status, 200);
  assert.ok(text.includes("<urlset"), "sitemap missing urlset");
  assert.ok(!text.trimStart().startsWith("<!DOCTYPE"), "sitemap returned HTML");

  const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0, "sitemap empty");
  const unique = new Set(locs);
  assert.equal(unique.size, locs.length, "sitemap has duplicate URLs");

  const expectedOrigin = isLocal ? new URL(BASE).origin : EXPECT_HOST;
  for (const loc of locs) {
    if (isLocal) {
      assert.ok(
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(loc) ||
          loc === "http://localhost:3000" ||
          loc.startsWith("http://localhost:3000/") ||
          loc.startsWith(expectedOrigin),
        `non-local host in local sitemap: ${loc}`
      );
    } else {
      assert.ok(loc.startsWith(EXPECT_HOST), `non-canonical host: ${loc}`);
    }
    assert.ok(!loc.includes("?"), `query URL in sitemap: ${loc}`);
    assert.ok(!/\/admin|\/api\//.test(loc), `private URL in sitemap: ${loc}`);
    assert.ok(
      !/nonexistent|demo-product|seed-/.test(loc),
      `suspicious URL in sitemap: ${loc}`
    );
  }

  const excursionUrls = locs.filter((u) => u.includes("/excursions/"));
  assert.ok(
    !excursionUrls.some((u) => u.includes("nonexistent")),
    "sitemap contains nonexistent excursion"
  );

  return { count: locs.length, locs };
}

async function main() {
  console.log(`SEO smoke base: ${BASE}`);
  const results = [];
  for (const spec of checks) {
    const row = await checkPage(spec);
    results.push(row);
    console.log(
      `  ${row.status} ${row.path} | title=${row.title?.slice(0, 60) || "-"} | robots=${row.robots || "-"}`
    );
  }

  const robots = await checkRobots();
  console.log("  robots.txt OK");

  const sitemap = await checkSitemap();
  console.log(`  sitemap.xml OK (${sitemap.count} URLs)`);

  // Optional: verify a few sitemap URLs resolve to 200 (cap).
  const sample = sitemap.locs.slice(0, Math.min(8, sitemap.locs.length));
  for (const loc of sample) {
    const path = loc.replace(new URL(loc).origin, "") || "/";
    const localUrl = `${BASE}${path === "" ? "/" : path}`;
    const { res } = await fetchText(localUrl, { redirect: "follow" });
    assert.ok(
      res.status === 200 || res.status === 404,
      `sitemap sample ${loc} → ${res.status}`
    );
    if (!isLocal) {
      assert.equal(res.status, 200, `live sitemap URL not 200: ${loc}`);
    } else {
      // Local demo sitemap may include demo routes; require 200 for core paths only.
      assert.ok(
        res.status === 200,
        `local sitemap URL not 200: ${loc} → ${res.status}`
      );
    }
  }

  console.log("\nSEO smoke passed.\n");
  // Keep robots snippet out of noisy CI logs unless debugging.
  if (process.env.SEO_SMOKE_VERBOSE) {
    console.log(robots);
  }
}

main().catch((err) => {
  console.error("\nSEO smoke FAILED\n");
  console.error(err);
  process.exit(1);
});
