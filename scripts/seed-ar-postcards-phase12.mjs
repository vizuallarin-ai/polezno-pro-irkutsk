/**
 * Phase 12: seed demo AR postcards into Payload CMS.
 * Run: npm run seed:ar-postcards
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { buildConfig, getPayload } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
nextEnv.loadEnvConfig(root);

const SITE_BASE =
  process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
  "https://irkportal.ru";

const SEED_POSTCARDS = [
  {
    title: "Деревянный дом — ожившая открытка",
    slug: "wooden-house-karl-marx",
    effectType: "coming_soon",
    status: "published",
    isFeatured: true,
    shortDescription:
      "Открытка по мотивам деревянного фасада на Карла Маркса — цифровой слой скоро.",
    place: "Иркутск",
    street: "ул. Карла Маркса",
    year: 1910,
    authorName: "Иркпортал",
    rightsType: "own_photo",
    relatedPhotoSlug: "wooden-house-karl-marx",
    relatedProductSlug: "postcards-no-cliches",
  },
  {
    title: "Набережная Ангары зимой",
    slug: "angara-embankment-winter",
    effectType: "animated_image",
    status: "published",
    isFeatured: true,
    shortDescription:
      "Лёгкая анимация зимнего кадра — без видео, честный цифровой слой.",
    place: "Набережная Ангары",
    year: 2024,
    authorName: "Алёна Ямщикова",
    rightsType: "own_photo",
    relatedPhotoSlug: "angara-embankment-winter",
  },
  {
    title: "Двор улицы Ленина",
    slug: "lenin-street-yard",
    effectType: "coming_soon",
    status: "draft",
    isFeatured: false,
    shortDescription: "Тихий двор — аудиоистория в подготовке.",
    street: "ул. Ленина",
    year: 2025,
    authorName: "Алёна Ямщикова",
    rightsType: "own_photo",
    relatedPhotoSlug: "lenin-street-yard",
  },
  {
    title: "Карта-прогулка в кармане",
    slug: "map-walk-postcard",
    effectType: "coming_soon",
    status: "published",
    isFeatured: false,
    shortDescription:
      "QR ведёт на маршрут по центру — видео-эффект появится позже.",
    place: "Центр Иркутска",
    authorName: "Иркпортал",
    rightsType: "own_photo",
    relatedProductSlug: "map-walk-center-irkutsk",
  },
  {
    title: "Площадь Кирова — деталь фасада",
    slug: "kirov-square-detail",
    effectType: "audio_story",
    status: "draft",
    isFeatured: false,
    shortDescription: "Черновик аудиоистории — публикация после записи звука.",
    place: "Площадь Кирова",
    year: 2023,
    authorName: "Алёна Ямщикова",
    rightsType: "own_photo",
    relatedPhotoSlug: "kirov-square-detail",
    audioTranscript:
      "Здесь появится текст аудиогида, когда запись будет готова.",
  },
];

async function ensurePlaceholderMedia(payload) {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: "seed-placeholder-ar-postcard.svg" } },
    limit: 1,
  });
  if (existing.docs[0]) return existing.docs[0].id;

  const svgPath = path.join(root, "public", "images", "map-preview.svg");
  const buffer = fs.readFileSync(svgPath);
  const media = await payload.create({
    collection: "media",
    data: { alt: "Демо AR-открытка Иркпортала" },
    file: {
      data: buffer,
      mimetype: "image/svg+xml",
      name: "seed-placeholder-ar-postcard.svg",
      size: buffer.length,
    },
  });
  return media.id;
}

async function findBySlug(payload, collection, slug) {
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  return res.docs[0]?.id ?? null;
}

async function loadPayload() {
  const { Users } = await import("../payload/collections/Users.ts");
  const { Media } = await import("../payload/collections/Media.ts");
  const { Routes } = await import("../payload/collections/Routes.ts");
  const { Places } = await import("../payload/collections/Places.ts");
  const { Articles } = await import("../payload/collections/Articles.ts");
  const { Events } = await import("../payload/collections/Events.ts");
  const { Products } = await import("../payload/collections/Products.ts");
  const { Makers } = await import("../payload/collections/Makers.ts");
  const { Photos } = await import("../payload/collections/Photos.ts");
  const { Excursions } = await import("../payload/collections/Excursions.ts");
  const { Reviews } = await import("../payload/collections/Reviews.ts");
  const { Partners } = await import("../payload/collections/Partners.ts");
  const { Leads } = await import("../payload/collections/Leads.ts");
  const { Guides } = await import("../payload/collections/Guides.ts");
  const { ArPostcards } = await import("../payload/collections/ArPostcards.ts");
  const { SiteSettings } = await import("../payload/globals/SiteSettings.ts");
  const { Navigation } = await import("../payload/globals/Navigation.ts");

  const config = buildConfig({
    secret: process.env.PAYLOAD_SECRET,
    collections: [
      Users,
      Routes,
      Leads,
      Articles,
      Photos,
      Events,
      Media,
      Places,
      Excursions,
      Makers,
      Products,
      ArPostcards,
      Guides,
      Reviews,
      Partners,
    ],
    globals: [SiteSettings, Navigation],
    editor: lexicalEditor(),
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URL },
      push: false,
    }),
  });

  return getPayload({ config });
}

async function main() {
  if (!process.env.DATABASE_URL?.trim() || !process.env.PAYLOAD_SECRET?.trim()) {
    console.error("DATABASE_URL and PAYLOAD_SECRET are required");
    process.exit(1);
  }

  const payload = await loadPayload();
  const mediaId = await ensurePlaceholderMedia(payload);

  for (const item of SEED_POSTCARDS) {
    const found = await payload.find({
      collection: "ar-postcards",
      where: { slug: { equals: item.slug } },
      limit: 1,
    });
    if (found.docs.length > 0) {
      console.log("skip", item.slug);
      continue;
    }

    const relatedPhoto = item.relatedPhotoSlug
      ? await findBySlug(payload, "photos", item.relatedPhotoSlug)
      : null;
    const relatedProduct = item.relatedProductSlug
      ? await findBySlug(payload, "products", item.relatedProductSlug)
      : null;

    const data = {
      title: item.title,
      slug: item.slug,
      effectType: item.effectType,
      status: item.status,
      isFeatured: item.isFeatured,
      shortDescription: item.shortDescription,
      place: item.place,
      street: item.street,
      year: item.year,
      authorName: item.authorName,
      rightsType: item.rightsType,
      coverImage: mediaId,
      postcardImage: mediaId,
      relatedPhoto: relatedPhoto || undefined,
      relatedProduct: relatedProduct || undefined,
      audioTranscript: item.audioTranscript,
      qrTargetUrl: `${SITE_BASE}/ar-postcards/${item.slug}`,
      seo: {
        title: `${item.title} — ожившие открытки Иркутска`,
        description: item.shortDescription,
      },
    };

    const created = await payload.create({
      collection: "ar-postcards",
      data,
    });
    console.log("created", item.slug, created.id);

    if (relatedProduct) {
      await payload.update({
        collection: "products",
        id: relatedProduct,
        data: { relatedArPostcard: created.id },
      });
      console.log("linked product", item.relatedProductSlug);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
