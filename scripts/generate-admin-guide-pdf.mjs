#!/usr/bin/env node
/**
 * Генерация PDF из docs/admin-guide.md
 * Запуск: node scripts/generate-admin-guide-pdf.mjs
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const mdPath = path.join(root, "docs", "admin-guide.md");
const cssPath = path.join(root, "docs", "admin-guide-pdf.css");
const pdfPath = path.join(root, "docs", "admin-guide.pdf");
const htmlPath = path.join(root, "docs", ".admin-guide-temp.html");

async function main() {
  let marked;
  let chromium;
  try {
    marked = (await import("marked")).marked;
    ({ chromium } = await import("playwright"));
  } catch {
    console.error(
      "Установите зависимости: npm install --save-dev marked playwright"
    );
    process.exit(1);
  }

  const md = readFileSync(mdPath, "utf8");
  const css = readFileSync(cssPath, "utf8");
  const body = marked.parse(md, { gfm: true });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Руководство по админке Иркпортал</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&subset=cyrillic,cyrillic-ext&display=swap"
    rel="stylesheet"
  />
  <style>${css}</style>
</head>
<body>${body}</body>
</html>`;

  writeFileSync(htmlPath, html, "utf8");

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "18mm", bottom: "20mm", left: "18mm" },
  });
  await browser.close();

  try {
    unlinkSync(htmlPath);
  } catch {
    /* ignore */
  }

  console.log(`PDF создан: ${pdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
