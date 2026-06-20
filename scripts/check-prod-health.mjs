#!/usr/bin/env node
/**
 * Быстрая проверка ключевых URL на production.
 * Использование: npm run check:prod
 * Переопределить хост: SITE_URL=https://irkportal.ru npm run check:prod
 */

const BASE = (process.env.SITE_URL || "https://irkportal.ru").replace(/\/$/, "");

const PATHS = [
  "/",
  "/map",
  "/explore",
  "/explore/photos",
  "/business",
  "/souvenirs",
  "/ar-postcards",
  "/contact",
  "/admin",
  "/sitemap.xml",
  "/robots.txt",
];

const REDIRECTS = [
  { path: "/shop", expect: "/souvenirs" },
  { path: "/program", expect: "/business" },
  { path: "/excursions", expect: "/map" },
];

async function check(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "GET",
    redirect: options.followRedirect === false ? "manual" : "follow",
  });
  return { path, status: res.status, url: res.url };
}

async function main() {
  console.log(`Checking ${BASE} …\n`);
  let failed = 0;

  for (const path of PATHS) {
    try {
      const { status } = await check(path);
      const ok = status >= 200 && status < 400;
      console.log(`${ok ? "✓" : "✗"} ${path} → ${status}`);
      if (!ok) failed++;
    } catch (err) {
      console.log(`✗ ${path} → ERROR ${err.message}`);
      failed++;
    }
  }

  for (const { path, expect } of REDIRECTS) {
    try {
      const url = `${BASE}${path}`;
      const res = await fetch(url, { method: "GET", redirect: "manual" });
      const location = res.headers.get("location") || "";
      const ok =
        (res.status === 301 || res.status === 308 || res.status === 307) &&
        location.includes(expect);
      console.log(
        `${ok ? "✓" : "✗"} redirect ${path} → ${res.status} (${location || "no location"})`
      );
      if (!ok) failed++;
    } catch (err) {
      console.log(`✗ redirect ${path} → ERROR ${err.message}`);
      failed++;
    }
  }

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
