#!/usr/bin/env node
/**
 * Lightweight PERF smoke — timing + HTML delivery checks (not a Lighthouse score).
 *
 * Usage:
 *   SEO_SMOKE_BASE=http://127.0.0.1:3000 node scripts/perf-smoke.mjs
 *   node scripts/perf-smoke.mjs   # defaults to LIVE https://irkportal.ru
 */
import assert from "node:assert/strict";

const BASE = (process.env.PERF_SMOKE_BASE || process.env.SEO_SMOKE_BASE || "https://irkportal.ru").replace(
  /\/$/,
  ""
);
const isLive = /irkportal\.ru$/.test(new URL(BASE).host);

const ROUTES = ["/", "/explore", "/map", "/business", "/about", "/contact"];

async function timedGet(path) {
  const started = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    headers: { "user-agent": "IrkPortal-PERF-Smoke/1.0", accept: "text/html" },
    redirect: "follow",
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const ms = Math.round(performance.now() - started);
  const html = buf.toString("utf8");
  return { status: res.status, ms, bytes: buf.byteLength, html };
}

function assertNoOpacityZeroBody(html, path) {
  // Reject the old site-wide Framer template initial={{ opacity: 0 }}
  // which serialized as style="opacity:0" on the page wrapper.
  const hasHiddenRoot =
    /style="[^"]*opacity:\s*0[^"]*"[^>]*>[\s\S]{0,200}<header/i.test(html) ||
    /style='[^']*opacity:\s*0[^']*'[^>]*>[\s\S]{0,200}<header/i.test(html);
  assert.equal(
    hasHiddenRoot,
    false,
    `${path}: HTML appears to hide content with opacity:0 before header`
  );
}

async function main() {
  console.log(`PERF smoke base: ${BASE} (${isLive ? "LIVE" : "CANDIDATE/local"})`);

  const rows = [];
  for (const path of ROUTES) {
    const row = await timedGet(path);
    assert.equal(row.status, 200, `${path} status ${row.status}`);
    assert.ok(row.html.includes("<html"), `${path} not HTML`);
    assert.ok(row.html.includes('lang="ru"'), `${path} missing lang=ru`);
    assertNoOpacityZeroBody(row.html, path);
    // Metrika must not be a blocking head inline boot on candidate builds.
    if (!isLive) {
      assert.ok(
        !row.html.includes("webvisor:true"),
        `${path}: webvisor still enabled on first paint`
      );
    }
    rows.push({ path, ...row });
    console.log(
      `  ${row.status} ${path.padEnd(10)} ${String(row.ms).padStart(5)} ms  ${String(row.bytes).padStart(7)} B`
    );
  }

  if (isLive) {
    const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
    assert.equal(health.commitSha, "7a6d971e81ecccc781a91e95ade257090f94a08a");
    console.log(`  LIVE SHA ok: ${health.commitSha}`);
  }

  console.log("\nPERF smoke passed (timing is diagnostic, not a hard budget).\n");
  return rows;
}

main().catch((err) => {
  console.error("\nPERF smoke FAILED\n");
  console.error(err);
  process.exit(1);
});
