/**
 * Phase 8: seed demo photos into Payload CMS.
 * Run: npm run seed:photos
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { getPayload } from "payload";
import config from "../payload.config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
nextEnv.loadEnvConfig(root);

const SEED_PHOTOS = [
  {
    title: "Деревянный дом на улице Карла Маркса",
    slug: "wooden-house-karl-marx",
    description:
      "Фасад с резными наличниками — пример иркутской деревянной застройки.",
    category: "wooden",
    photoType: "old",
    period: "начало XX века",
    street: "ул. Карла Маркса",
    place: "Иркутск",
    authorName: "Архив города",
    sourceName: "Демо-материал",
    rightsType: "licensed",
  },
  {
    title: "Набережная Ангары зимой",
    slug: "angara-embankment-winter",
    description: "Лёд, туман и силуэты центра.",
    category: "winter",
    photoType: "modern",
    year: 2024,
    place: "Набережная Ангары",
    authorName: "Алёна Ямщикова",
    rightsType: "own_photo",
  },
  {
    title: "Деталь фасада у площади Кирова",
    slug: "kirov-square-detail",
    description: "Город читается в мелочах второго этажа.",
    category: "details",
    photoType: "detail",
    year: 2023,
    place: "Площадь Кирова",
    authorName: "Алёна Ямщикова",
    rightsType: "own_photo",
  },
  {
    title: "Двор улицы Ленина",
    slug: "lenin-street-yard",
    description: "Тихий двор за парадной линией.",
    category: "yards",
    photoType: "modern",
    year: 2025,
    street: "ул. Ленина",
    authorName: "Алёна Ямщикова",
    rightsType: "own_photo",
  },
];

async function ensurePlaceholderMedia(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: "seed-placeholder-photo.svg" } },
    limit: 1,
  });
  if (existing.docs[0]) return existing.docs[0].id;

  const svgPath = path.join(root, "public", "images", "map-preview.svg");
  const buffer = fs.readFileSync(svgPath);
  const media = await payload.create({
    collection: "media",
    data: { alt: "Демо-фото Иркутска" },
    file: {
      data: buffer,
      mimetype: "image/svg+xml",
      name: "seed-placeholder-photo.svg",
      size: buffer.length,
    },
  });
  return media.id;
}

async function main() {
  const payload = await getPayload({ config });
  const mediaId = await ensurePlaceholderMedia(payload);

  for (const photo of SEED_PHOTOS) {
    const found = await payload.find({
      collection: "photos",
      where: { slug: { equals: photo.slug } },
      limit: 1,
    });
    if (found.docs.length > 0) {
      console.log("skip", photo.slug);
      continue;
    }

    await payload.create({
      collection: "photos",
      data: {
        ...photo,
        image: mediaId,
        status: "published",
        moderationStatus: "approved",
        permissionConfirmed: true,
        publishedAt: new Date().toISOString(),
      },
    });
    console.log("created", photo.slug);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
