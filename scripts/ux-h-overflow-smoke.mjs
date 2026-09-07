/**
 * UX.H reusable horizontal-overflow smoke (Playwright).
 * Usage: node scripts/ux-h-overflow-smoke.mjs http://127.0.0.1:3000 [outJson]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const outPath =
  process.argv[3] ||
  path.join(".deploy-artifacts", "ux-h", "overflow-smoke.json");

const viewports = [320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440];
const routes = [
  "/",
  "/map",
  "/explore",
  "/business",
  "/contact",
  "/about",
  "/about/guides",
  "/souvenirs",
  "/ar-postcards",
  "/events",
  "/explore/photos",
  "/privacy",
  "/program",
];

const TOLERANCE_PX = 1;

const browser = await chromium.launch({ headless: true });

const results = [];
let failed = 0;

try {
  for (const width of viewports) {
    const context = await browser.newContext({
      viewport: { width, height: Math.max(700, Math.round(width * 1.8)) },
    });
    const page = await context.newPage();

    for (const route of routes) {
      const url = `${base}${route}`;
      let status = null;
      let overflow = false;
      let offenders = [];
      let error = null;
      try {
        const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 300000 });
        status = resp?.status() ?? null;
        await page.waitForTimeout(800);
        const metrics = await page.evaluate((tol) => {
          const doc = document.documentElement;
          const body = document.body;
          const client = doc.clientWidth;
          const scroll = Math.max(doc.scrollWidth, body?.scrollWidth || 0);
          const overflowX = scroll > client + tol;
          const bad = [];
          if (overflowX) {
            for (const el of document.querySelectorAll("body *")) {
              const r = el.getBoundingClientRect();
              if (r.width < 2 || r.height < 2) continue;
              if (r.right > client + tol + 2 || r.left < -2) {
                const tag = el.tagName.toLowerCase();
                const cls = (el.className && String(el.className).slice?.(0, 80)) || "";
                bad.push({
                  tag,
                  cls,
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                });
                if (bad.length >= 8) break;
              }
            }
          }

          const brand = document.querySelector("header a.type-brand, header a[class*='type-brand']");
          const brandRect = brand?.getBoundingClientRect();
          const brandText = (brand?.textContent || "").trim();
          const brandClipped = brand
            ? brand.scrollWidth > brand.clientWidth + 1
            : false;

          const headerCtaEl = document.querySelector(
            "header a.cta-primary, header a.cta-label.cta-primary"
          );
          const headerCtaVisible = Boolean(
            headerCtaEl &&
              (() => {
                const r = headerCtaEl.getBoundingClientRect();
                const cs = getComputedStyle(headerCtaEl);
                return (
                  r.width > 0 &&
                  r.height > 0 &&
                  cs.display !== "none" &&
                  cs.visibility !== "hidden" &&
                  cs.opacity !== "0"
                );
              })()
          );
          const headerCtaText = headerCtaEl
            ? (headerCtaEl.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60)
            : null;
          const burger = document.querySelector(
            'header button[aria-label="Открыть меню"], header button[aria-label="Закрыть меню"]'
          );
          const burgerVisible = Boolean(
            burger &&
              (() => {
                const r = burger.getBoundingClientRect();
                return r.width > 0 && r.height > 0;
              })()
          );

          return {
            client,
            scroll,
            overflowX,
            offenders: bad,
            brandText,
            brandWidth: brandRect ? Math.round(brandRect.width) : null,
            brandClipped,
            headerCtaVisible,
            burgerVisible,
            nestedMainCount: document.querySelectorAll("main").length,
            headerCtaText,
          };
        }, TOLERANCE_PX);
        overflow = metrics.overflowX;
        offenders = metrics.offenders;
        const headerFail =
          (width < 1024 && metrics.headerCtaVisible) ||
          (width >= 1024 && !metrics.headerCtaVisible) ||
          metrics.brandClipped ||
          (width < 1024 && !metrics.burgerVisible) ||
          (width >= 1024 && metrics.burgerVisible) ||
          metrics.nestedMainCount !== 1;
        if (overflow || headerFail) failed += 1;
        results.push({
          width,
          route,
          status,
          overflow,
          scrollWidth: metrics.scroll,
          clientWidth: metrics.client,
          offenders,
          brandText: metrics.brandText,
          brandClipped: metrics.brandClipped,
          headerCtaVisible: metrics.headerCtaVisible,
          headerCtaText: metrics.headerCtaText,
          burgerVisible: metrics.burgerVisible,
          nestedMainCount: metrics.nestedMainCount,
          headerFail,
        });
        console.log(
          `${width} ${route} status=${status} overflow=${overflow} brandClip=${metrics.brandClipped} ctaVis=${metrics.headerCtaVisible} cta="${metrics.headerCtaText || ""}" burger=${metrics.burgerVisible} mains=${metrics.nestedMainCount}${headerFail ? " HEADER_FAIL" : ""}${overflow ? ` offenders=${offenders.length}` : ""}`
        );
      } catch (err) {
        failed += 1;
        error = String(err.message || err);
        results.push({ width, route, status, overflow: true, error });
        console.log(`${width} ${route} FAIL ${error}`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

mkdirSync(path.dirname(outPath), { recursive: true });
const report = {
  base,
  finishedAt: new Date().toISOString(),
  tolerancePx: TOLERANCE_PX,
  failCount: failed,
  pass: failed === 0,
  results,
};
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass: report.pass, failCount: failed, outPath }, null, 2));
process.exit(report.pass ? 0 : 2);
