/**
 * Generates public/og-default.jpg — branded Open Graph fallback.
 * Run: node scripts/generate-og-default.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dirname, "../public/og-default.jpg");

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#FAF9F7"/>
  <rect x="900" y="0" width="300" height="630" fill="#E8E6E3"/>
  <text x="80" y="120" font-family="Georgia, serif" font-size="22" letter-spacing="6" fill="#6B6B6B">ИРКПОРТАЛ</text>
  <text x="80" y="280" font-family="Georgia, serif" font-size="64" fill="#1C1C1E">Иркутск без штампов</text>
  <text x="80" y="360" font-family="Arial, sans-serif" font-size="28" fill="#6B6B6B">Авторский навигатор Алёны Ямщиковой</text>
  <circle cx="80" cy="520" r="6" fill="#0B3D5C"/>
  <text x="100" y="528" font-family="Arial, sans-serif" font-size="20" letter-spacing="3" fill="#0B3D5C">IRKPORTAL.RU</text>
</svg>
`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(out);
console.log("Wrote", out);
