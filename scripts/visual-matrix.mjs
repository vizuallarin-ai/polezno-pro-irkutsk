/**
 * Gate 1 visual matrix — Playwright, local exact server only.
 * Does not submit forms. Writes screenshots + report JSON under outDir.
 *
 * Usage:
 *   npx playwright test  (not used)
 *   node scripts/visual-matrix.mjs http://127.0.0.1:31247 <outDir>
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const base = (process.argv[2] || "http://127.0.0.1:31247").replace(/\/$/, "");
const outDir = process.argv[3];
if (!outDir) {
  console.error("outDir required");
  process.exit(1);
}
mkdirSync(path.join(outDir, "screenshots"), { recursive: true });

const viewports = [
  { id: "360x800", width: 360, height: 800 },
  { id: "390x844", width: 390, height: 844 },
  { id: "430x932", width: 430, height: 932 },
  { id: "768x1024", width: 768, height: 1024 },
  { id: "1280x800", width: 1280, height: 800 },
  { id: "1440x900", width: 1440, height: 900 },
];

const routes = [
  { id: "home", path: "/" },
  { id: "map", path: "/map" },
  { id: "contact", path: "/contact?intent=walk&sourceBlock=visual-matrix" },
  { id: "business", path: "/business" },
  { id: "explore", path: "/explore" },
  { id: "souvenirs", path: "/souvenirs" },
  { id: "ar", path: "/ar-postcards" },
  { id: "photos", path: "/explore/photos" },
  { id: "about", path: "/about" },
  { id: "guides", path: "/about/guides" },
];

function classifyFindings(row) {
  const findings = [];
  if (row.overflowX) findings.push({ sev: "P1", code: "horizontal_overflow" });
  const errs = row.consoleErrors || [];
  const isLocalThirdParty = (e) =>
    /ERR_CERT_AUTHORITY_INVALID/i.test(e) ||
    /api-maps\.yandex\.ru/i.test(e) ||
    /CORS policy/i.test(e) ||
    (/ERR_FAILED/i.test(e) &&
      errs.some((x) => /api-maps\.yandex|CORS policy/i.test(x)));
  const realConsole = errs.filter((e) => !isLocalThirdParty(e));
  const thirdParty = errs.filter((e) => isLocalThirdParty(e));
  if (realConsole.length)
    findings.push({ sev: "P1", code: "console_error", detail: realConsole.slice(0, 3) });
  else if (thirdParty.length)
    findings.push({
      sev: "P2",
      code: "localhost_third_party_console",
      detail: thirdParty.slice(0, 2),
    });
  if (row.hasDemoOrGuidePlaceholder)
    findings.push({ sev: "P0", code: "demo_or_guide_placeholder" });
  if (row.smallTapTargets?.length)
    findings.push({
      sev: "P1",
      code: "tap_target_lt_44",
      detail: row.smallTapTargets.slice(0, 5),
    });
  if (row.id === "home" && row.headerPrimaryHref?.startsWith("/business"))
    findings.push({
      sev: "P1",
      code: "header_b2c_cta_points_business",
      detail: row.headerPrimaryHref,
    });
  if (row.id === "map" && row.filterFailureWithoutCatalog)
    findings.push({ sev: "P0", code: "map_filter_failure_on_empty" });
  if (row.id === "guides" && row.hasDemoOrGuidePlaceholder)
    findings.push({ sev: "P0", code: "guide_placeholder" });
  return findings;
}

const report = {
  base,
  startedAt: new Date().toISOString(),
  viewports: {},
  findings: [],
};

const browser = await chromium.launch({ headless: true });

try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("pageerror", (err) => consoleErrors.push(String(err.message || err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    report.viewports[vp.id] = [];

    for (const route of routes) {
      consoleErrors.length = 0;
      const url = `${base}${route.path}`;
      let resp = null;
      try {
        resp = await page.goto(url, { waitUntil: "load", timeout: 60000 });
        await page.waitForTimeout(800);
      } catch (err) {
        const row = {
          id: route.id,
          path: route.path,
          status: null,
          consoleErrors: [...consoleErrors, String(err.message || err)],
          overflowX: false,
          findings: [{ sev: "P1", code: "navigation_timeout", detail: String(err.message || err) }],
          screenshot: null,
        };
        report.viewports[vp.id].push(row);
        report.findings.push(
          ...row.findings.map((f) => ({ ...f, viewport: vp.id, route: route.id }))
        );
        console.log(`${vp.id} ${route.path} NAV_FAIL findings=1`);
        continue;
      }

      // Mobile nav open check on home @360
      let mobileNavOpen = null;
      if (route.id === "home" && vp.width <= 430) {
        const burger = page.locator('header button[aria-label="Открыть меню"], header button[aria-label="Закрыть меню"]').first();
        if ((await burger.count()) && (await burger.isVisible())) {
          await burger.click();
          await page.waitForTimeout(300);
          mobileNavOpen = await page.evaluate(() => {
            const expanded = document.querySelector(
              'header button[aria-label="Закрыть меню"][aria-expanded="true"], header button[aria-expanded="true"][aria-label*="меню"]'
            );
            const drawerLinks = [...document.querySelectorAll("header a")].filter((a) => {
              const r = a.getBoundingClientRect();
              return r.height > 0 && r.width > 0;
            }).length;
            return { expanded: Boolean(expanded), visibleLinks: drawerLinks };
          });
          const closer = page.locator('header button[aria-label="Закрыть меню"]').first();
          if (await closer.count()) await closer.click().catch(() => {});
          await page.waitForTimeout(200);
        }
      }

      // Focus state on primary header CTA once per desktop home
      let focusOk = null;
      if (route.id === "home" && vp.id === "1440x900") {
        const cta = page.locator("header a.bg-primary, header a[class*='bg-primary']").first();
        if (await cta.count()) {
          await cta.focus();
          focusOk = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el) return { focused: false };
            const cs = getComputedStyle(el);
            return {
              focused: true,
              outline: cs.outlineStyle,
              outlineWidth: cs.outlineWidth,
              boxShadow: cs.boxShadow,
              tag: el.tagName,
              text: (el.textContent || "").trim().slice(0, 40),
            };
          });
        }
      }

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const overflowX =
          Math.max(doc.scrollWidth, body.scrollWidth) > window.innerWidth + 1;

        const primaryButtons = [
          ...document.querySelectorAll(
            "header a.bg-primary, header a[class*='bg-primary'], a.min-h-\\[44px\\], a.h-11, a.h-12"
          ),
        ];
        // Also include visible primary CTAs by exact label in header/hero
        const labeled = [...document.querySelectorAll("a, button")].filter((el) => {
          const t = (el.textContent || "").replace(/\s+/g, " ").trim();
          const inHeader = Boolean(el.closest("header"));
          const inHero = Boolean(
            el.closest("[class*='hero'], section:first-of-type, main > section:first-child")
          );
          return (
            (inHeader || inHero) &&
            (t === "Подобрать мне прогулку" ||
              t === "Подобрать прогулку" ||
              t === "Смотреть маршруты" ||
              t === "Пройти с Алёной" ||
              t === "Спланировать" ||
              t === "Спланировать визит" ||
              (inHeader && t === "Связаться"))
          );
        });

        function isNarrow() {
          return window.innerWidth < 768;
        }

        const smallTapTargets = [];
        for (const el of [...new Set([...primaryButtons, ...labeled])]) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.height < 44 || (isNarrow() && r.width < 44)) {
            smallTapTargets.push({
              text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
              w: Math.round(r.width),
              h: Math.round(r.height),
            });
          }
        }

        const html = document.documentElement.outerHTML;
        const text = document.body.innerText || "";
        const headerLink = [...document.querySelectorAll("header a")].find((a) =>
          /Смотреть маршруты|Подобрать мне прогулку|Подобрать прогулку|Обсудить программу/.test(
            a.textContent || ""
          )
        );

        const heroLinks = [...document.querySelectorAll("main a, [class*='hero'] a, section a")]
          .filter((a) =>
            /Смотреть маршруты|Подобрать мне прогулку|Подобрать прогулку|Для бизнеса/.test(
              a.textContent || ""
            )
          )
          .slice(0, 6)
          .map((a) => ({
            text: (a.textContent || "").trim(),
            href: a.getAttribute("href"),
          }));

        const fontSample = (() => {
          const el = document.querySelector("body, p, a, button");
          if (!el) return null;
          const ff = getComputedStyle(el).fontFamily || "";
          return {
            fontFamily: ff.slice(0, 120),
            hasOnest: /onest/i.test(ff),
            hasGeist: /geist/i.test(ff),
          };
        })();

        return {
          overflowX,
          title: document.title,
          fontSample,
          hasDemoOrGuidePlaceholder:
            /Демо-|demo-|seed-|Имя Гида/i.test(html) || /Имя Гида/.test(text),
          hasPrelaunch:
            /готовятся|Коллекция готовится|наполняется|в подготовке|появятся|редакционной|Маршруты по Иркутску/i.test(
              text
            ),
          filterFailureWithoutCatalog:
            /Ничего не найдено/.test(text) &&
            !/готовятся|редакционной|Подобрать|Маршруты по Иркутску/i.test(text),
          headerPrimaryHref: headerLink ? headerLink.getAttribute("href") : null,
          headerPrimaryText: headerLink
            ? (headerLink.textContent || "").replace(/\s+/g, " ").trim()
            : null,
          heroLinks,
          smallTapTargets,
          hasNav: Boolean(document.querySelector("nav, header")),
          hasFooter: Boolean(document.querySelector("footer")),
        };
      });

      // Form validation without submit (contact + business only, once per desktop)
      let formValidation = null;
      if (
        (route.id === "contact" || route.id === "business") &&
        vp.id === "390x844"
      ) {
        const submit = page.locator('button[type="submit"]').first();
        if (await submit.count()) {
          await submit.click({ force: true });
          await page.waitForTimeout(400);
          formValidation = await page.evaluate(() => {
            const invalid = [...document.querySelectorAll(":invalid")].length;
            const errNodes = [
              ...document.querySelectorAll('[role="alert"], .text-destructive, [aria-invalid="true"]'),
            ];
            const text = document.body.innerText || "";
            const sawErrorUi =
              errNodes.length > 0 ||
              /Введите имя|Укажите контакт|Опишите задачу|Подтвердите согласие|обязател|заполн/i.test(
                text
              );
            return { invalidCount: invalid, sawErrorUi, errNodeCount: errNodes.length };
          });
        }
      }

      const shotName = `${vp.id}__${route.id}.png`;
      await page.screenshot({
        path: path.join(outDir, "screenshots", shotName),
        fullPage: false,
      });

      const row = {
        id: route.id,
        path: route.path,
        status: resp?.status() ?? null,
        consoleErrors: [...consoleErrors],
        formValidation,
        mobileNavOpen,
        focusOk,
        screenshot: `screenshots/${shotName}`,
        ...metrics,
      };
      row.findings = classifyFindings(row);
      report.viewports[vp.id].push(row);
      report.findings.push(
        ...row.findings.map((f) => ({ ...f, viewport: vp.id, route: route.id }))
      );
      console.log(
        `${vp.id} ${route.path} status=${row.status} overflow=${row.overflowX} findings=${row.findings.length}`
      );
    }

    await context.close();
  }
} finally {
  await browser.close();
}

report.finishedAt = new Date().toISOString();
report.p0 = report.findings.filter((f) => f.sev === "P0");
report.p1 = report.findings.filter((f) => f.sev === "P1");
report.p2 = report.findings.filter((f) => f.sev === "P2");
report.pass = report.p0.length === 0 && report.p1.length === 0;

writeFileSync(path.join(outDir, "visual-matrix-report.json"), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      pass: report.pass,
      p0: report.p0.length,
      p1: report.p1.length,
      p2: report.p2.length,
      findings: report.findings,
    },
    null,
    2
  )
);
process.exit(report.pass ? 0 : 2);
