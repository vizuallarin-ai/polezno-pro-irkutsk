#!/usr/bin/env node
/**
 * Быстрая проверка ключевых URL на production.
 * Использование: npm run check:prod
 * Переопределить хост: SITE_URL=https://irkportal.ru npm run check:prod
 * Сверка SHA: EXPECTED_GIT_SHA=$(git rev-parse HEAD) npm run check:prod
 */

const BASE = (process.env.SITE_URL || "https://irkportal.ru").replace(/\/$/, "");
const EXPECTED_SHA = process.env.EXPECTED_GIT_SHA?.trim() || "";

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
  "/api/health",
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
  return { path, status: res.status, url: res.url, res };
}

async function checkHealthSha() {
  if (!EXPECTED_SHA) {
    console.log("○ /api/health SHA check skipped (EXPECTED_GIT_SHA not set)");
    return 0;
  }

  try {
    const res = await fetch(`${BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) {
      console.log(`✗ /api/health → ${res.status} (SHA check blocked)`);
      return 1;
    }
    const body = await res.json();
    if (body.project !== "irkportal") {
      console.log(`✗ /api/health project mismatch (${body.project ?? "missing"})`);
      return 1;
    }
    if (!body.commitSha || body.commitSha === "unknown") {
      console.log("✗ /api/health commitSha is unknown (FAIL until deploy with GIT_COMMIT_SHA)");
      return 1;
    }
    const ok = body.commitSha === EXPECTED_SHA;
    console.log(
      `${ok ? "✓" : "✗"} /api/health SHA ${body.commitSha}${ok ? "" : ` (expected ${EXPECTED_SHA})`}`
    );
    return ok ? 0 : 1;
  } catch (err) {
    console.log(`✗ /api/health SHA check → ERROR ${err.message}`);
    return 1;
  }
}

async function main() {
  console.log(`Checking ${BASE} …\n`);
  let failed = 0;

  for (const path of PATHS) {
    try {
      const { status, res } = await check(path);
      const ok = status >= 200 && status < 400;
      console.log(`${ok ? "✓" : "✗"} ${path} → ${status}`);
      if (!ok) failed++;

      if (path === "/api/health" && ok) {
        try {
          const body = await res.clone().json();
          console.log(
            `  health: project=${body.project ?? "?"} commitSha=${body.commitSha ?? "?"} buildTimestamp=${body.buildTimestamp ?? "?"}`
          );
        } catch {
          console.log("  health: invalid JSON body");
        }
      }
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

  failed += await checkHealthSha();

  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
