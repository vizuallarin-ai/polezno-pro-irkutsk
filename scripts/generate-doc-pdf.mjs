#!/usr/bin/env node
/**
 * Генерация PDF из markdown-документов в docs/
 * Запуск: node scripts/generate-doc-pdf.mjs <input.md> [output.pdf]
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const inputArg = process.argv[2];
const outputArg = process.argv[3];

if (!inputArg) {
  console.error(
    "Usage: node scripts/generate-doc-pdf.mjs <input.md> [output.pdf]"
  );
  process.exit(1);
}

const mdPath = path.isAbsolute(inputArg)
  ? inputArg
  : path.join(root, inputArg);
const pdfPath = outputArg
  ? path.isAbsolute(outputArg)
    ? outputArg
    : path.join(root, outputArg)
  : mdPath.replace(/\.md$/i, ".pdf");
const cssPath = path.join(root, "docs", "admin-guide-pdf.css");
const htmlPath = path.join(root, "docs", `.${path.basename(mdPath)}.temp.html`);

async function main() {
  if (!existsSync(mdPath)) {
    console.error(`Файл не найден: ${mdPath}`);
    process.exit(1);
  }

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
  const css = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";
  const body = marked.parse(md, { gfm: true });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
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
    margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
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
