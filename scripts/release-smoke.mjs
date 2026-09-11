#!/usr/bin/env node
/**
 * RELEASE.1 — Post-deploy / readiness smoke (HTTP only, no DB writes).
 *
 * Default target: https://irkportal.ru
 * Does NOT submit leads. Lead path is documented separately (--lead-plan).
 *
 * Usage:
 *   npm run release:smoke
 *   EXPECTED_GIT_SHA=<40hex> npm run release:smoke
 *   SITE_URL=http://127.0.0.1:3000 npm run release:smoke
 */
const BASE = (process.env.SITE_URL || "https://irkportal.ru").replace(/\/$/, "");
const EXPECTED_SHA = process.env.EXPECTED_GIT_SHA?.trim() || "";
const LEAD_PLAN = process.argv.includes("--lead-plan");

const PATHS = [
  { path: "/", marker: null },
  { path: "/explore", marker: null },
  { path: "/business", marker: null },
  { path: "/about", marker: null },
  { path: "/contact", marker: null },
  { path: "/api/health", marker: null },
];

function printLeadPlan() {
  console.log(`
LEAD PATH SMOKE (controlled — do NOT run against production without owner approval)

Convention:
  name:  RELEASE1 Smoke <YYYYMMDD>
  email: release1-smoke+<stamp>@example.invalid
  phone: +70000000000
  marker field / message: [RELEASE1-SMOKE] <stamp>

Expected:
  POST /api/public/leads → 200 { ok: true, id }
  Payload admin → Leads collection shows row with marker
  Cleanup: delete that lead in admin (or SQL delete by marker) after proof

Never use real customer PII. Prefer staging / disposable DB when possible.
`);
}

async function main() {
  if (LEAD_PLAN) {
    printLeadPlan();
    process.exit(0);
  }

  console.log(`Release smoke → ${BASE}\n`);
  let failed = 0;

  for (const { path: p } of PATHS) {
    const url = `${BASE}${p}`;
    try {
      const res = await fetch(url, { redirect: "follow", cache: "no-store" });
      const ok = res.status >= 200 && res.status < 400;
      console.log(`${ok ? "✓" : "✗"} ${p} → ${res.status}`);
      if (!ok) {
        failed++;
        continue;
      }

      if (p === "/api/health") {
        const body = await res.json();
        console.log(
          `  status=${body.status} project=${body.project} commitSha=${body.commitSha} database=${body.database ?? "n/a"} app=${body.app ?? "n/a"}`
        );
        if (body.project !== "irkportal") {
          console.log("✗ health project mismatch");
          failed++;
        }
        if (body.status === "degraded" || res.status === 503) {
          console.log("✗ health degraded / dependency failure");
          failed++;
        }
        if (EXPECTED_SHA) {
          if (body.commitSha !== EXPECTED_SHA) {
            console.log(`✗ SHA mismatch got=${body.commitSha} expected=${EXPECTED_SHA}`);
            failed++;
          } else {
            console.log(`✓ SHA matches ${EXPECTED_SHA}`);
          }
        }
      } else {
        const text = await res.text();
        if (/Application error|Internal Server Error|__NEXT_ERROR__/i.test(text)) {
          console.log(`✗ ${p} looks like an error page`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`✗ ${p} → ERROR ${err.message}`);
      failed++;
    }
  }

  console.log(
    failed === 0 ? "\nSmoke PASS" : `\nSmoke FAIL (${failed})`
  );
  console.log("Lead path: npm run release:smoke -- --lead-plan");
  process.exit(failed === 0 ? 0 : 1);
}

main();
