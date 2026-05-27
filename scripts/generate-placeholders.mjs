/**
 * Генерирует SVG-плейсхолдеры для всех изображений сайта.
 * Запуск: node scripts/generate-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "../public");

const placeholders = [
  // Hero
  { name: "images/hero-poster.jpg", w: 1920, h: 1080, label: "HERO VIDEO POSTER", bg: "#1C1C1E", fg: "#4A4A5A" },

  // Founder
  { name: "images/founder-portrait.jpg", w: 800, h: 1067, label: "ПОРТРЕТ", bg: "#E8E6E3", fg: "#9CA3AF" },

  // Directions
  { name: "images/direction-tours.jpg", w: 800, h: 600, label: "ТУРЫ", bg: "#D8D6D2", fg: "#6B6B6B" },
  { name: "images/direction-excursions.jpg", w: 800, h: 600, label: "ЭКСКУРСИИ", bg: "#D8D6D2", fg: "#6B6B6B" },
  { name: "images/direction-consulting.jpg", w: 800, h: 600, label: "КОНСАЛТИНГ", bg: "#D8D6D2", fg: "#6B6B6B" },
  { name: "images/direction-education.jpg", w: 800, h: 600, label: "ОБРАЗОВАНИЕ", bg: "#D8D6D2", fg: "#6B6B6B" },
  { name: "images/direction-shop.jpg", w: 800, h: 600, label: "МАГАЗИН", bg: "#D8D6D2", fg: "#6B6B6B" },

  // Map
  { name: "images/map-preview.jpg", w: 800, h: 600, label: "КАРТА ИРКУТСКА", bg: "#A8D4E6", fg: "#0B3D5C" },

  // Articles
  { name: "images/article-wooden.jpg", w: 800, h: 533, label: "ДЕРЕВЯННОЕ ЗОДЧЕСТВО", bg: "#C4A882", fg: "#5C3A1E" },
  { name: "images/article-food.jpg", w: 800, h: 533, label: "ГАСТРОНОМИЯ", bg: "#E8D5B7", fg: "#8B5E3C" },
  { name: "images/article-hidden.jpg", w: 800, h: 533, label: "HIDDEN PLACES", bg: "#C8C4C0", fg: "#4A4A5A" },
  { name: "images/article-baikal.jpg", w: 800, h: 533, label: "БАЙКАЛ", bg: "#A8D4E6", fg: "#0B3D5C" },

  // Explore categories
  { name: "images/explore-sights.jpg", w: 600, h: 600, label: "ЧТО ПОСМОТРЕТЬ", bg: "#E0DDD9", fg: "#6B6B6B" },
  { name: "images/explore-walks.jpg", w: 600, h: 600, label: "ГДЕ ГУЛЯТЬ", bg: "#D5E8D4", fg: "#3A5C3A" },
  { name: "images/explore-food.jpg", w: 600, h: 600, label: "ГДЕ ПОЕСТЬ", bg: "#F0E4D0", fg: "#8B5E3C" },
  { name: "images/explore-stay.jpg", w: 600, h: 600, label: "ГДЕ ОСТАНОВИТЬСЯ", bg: "#E8E6E3", fg: "#6B6B6B" },
  { name: "images/explore-history.jpg", w: 600, h: 600, label: "ИСТОРИЯ", bg: "#D8D0C4", fg: "#4A3C2E" },
  { name: "images/explore-baikal.jpg", w: 600, h: 600, label: "БАЙКАЛ РЯДОМ", bg: "#C0DDE8", fg: "#0B3D5C" },
  { name: "images/explore-hidden.jpg", w: 600, h: 600, label: "HIDDEN PLACES", bg: "#D8D6D2", fg: "#4A4A5A" },
  { name: "images/explore-facts.jpg", w: 600, h: 600, label: "ИНТЕРЕСНЫЕ ФАКТЫ", bg: "#E8E4D8", fg: "#5C5040" },

  // Products
  { name: "images/product-sweatshirt.jpg", w: 600, h: 600, label: "СВИТШОТ БАЙКАЛ", bg: "#0B3D5C", fg: "#A8D4E6" },
  { name: "images/product-poster.jpg", w: 600, h: 600, label: "ПОСТЕР", bg: "#FAF9F7", fg: "#1C1C1E" },
  { name: "images/product-postcards.jpg", w: 600, h: 600, label: "ОТКРЫТКИ", bg: "#F0ECE4", fg: "#6B6B6B" },
  { name: "images/product-guide.jpg", w: 600, h: 600, label: "ПУТЕВОДИТЕЛЬ", bg: "#E8E6E3", fg: "#4A4A5A" },
];

function makeSVG(w, h, label, bg, fg) {
  const fontSize = Math.min(w, h) * 0.04;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <text x="${w / 2}" y="${h / 2 + fontSize / 3}" font-family="Arial" font-size="${fontSize}" fill="${fg}" text-anchor="middle" letter-spacing="3" opacity="0.7">${label}</text>
</svg>`;
}

let created = 0;
for (const p of placeholders) {
  const fullPath = join(publicDir, p.name);
  const dir = dirname(fullPath);
  mkdirSync(dir, { recursive: true });

  // Generate as SVG (rename to .jpg/.png for Next.js, but serve as SVG)
  // For real use, replace with actual photos
  const svgPath = fullPath.replace(/\.(jpg|png|jpeg)$/, ".svg");
  writeFileSync(svgPath, makeSVG(p.w, p.h, p.label, p.bg, p.fg));
  created++;
}

console.log(`✓ Создано ${created} SVG-плейсхолдеров в public/images/`);
console.log("  Замените их на реальные фотографии перед запуском.");
